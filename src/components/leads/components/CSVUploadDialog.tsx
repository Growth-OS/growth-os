import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CSVUploadDialogProps {
  onSuccess: () => void;
}

export const CSVUploadDialog = ({ onSuccess }: CSVUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const processCSV = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setErrors([]);

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(header => header.trim().toLowerCase());

      const requiredFields = ['email', 'first name'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
      }

      const leads = [];
      const newErrors = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length !== headers.length) continue;

        const lead: Record<string, any> = {};
        let hasError = false;

        headers.forEach((header, index) => {
          // Trim whitespace and handle empty values
          const value = row[index].trim();
          lead[header] = value || null;
        });

        if (!validateEmail(lead.email)) {
          newErrors.push(`Row ${i}: Invalid email address - ${lead.email}`);
          hasError = true;
        }

        if (!lead['first name']) {
          newErrors.push(`Row ${i}: Missing first name`);
          hasError = true;
        }

        if (!hasError) {
          // Map the "other" column to notes if notes is not present
          const notes = lead.notes || lead.note || lead.other || '';
          
          // Ensure source is one of the valid values
          const validSources = ['website', 'referral', 'linkedin', 'cold_outreach', 'conference', 'accelerator', 'other'];
          const source = lead.source && validSources.includes(lead.source.toLowerCase()) 
            ? lead.source.toLowerCase() 
            : 'other';

          leads.push({
            company_name: lead['company name'] || lead.company || '',
            contact_email: lead.email,
            first_name: lead['first name'],
            company_website: lead.website || lead['company website'] || '',
            contact_linkedin: lead.linkedin || lead['linkedin profile'] || '',
            contact_job_title: lead['job title'] || lead.position || '',
            notes: notes,
            source: source,
            status: 'new'
          });
        }

        setProgress(Math.round((i / rows.length) * 100));
      }

      setErrors(newErrors);

      if (leads.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('You must be logged in to upload leads');
        }

        const batchSize = 100;
        for (let i = 0; i < leads.length; i += batchSize) {
          const batch = leads.slice(i, i + batchSize).map(lead => ({
            ...lead,
            user_id: user.id
          }));

          const { error } = await supabase
            .from('leads')
            .insert(batch);

          if (error) throw error;
        }

        toast.success(`Successfully uploaded ${leads.length} leads`);
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to process CSV file');
      setErrors(prev => [...prev, error.message]);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      processCSV(file);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Drop the CSV file here"
            : "Drag and drop your CSV file here, or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Only CSV files are supported
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 text-center">
            Processing... {progress}%
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <h4 className="font-medium">Upload Errors</h4>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">CSV Format Guidelines</h4>
        <p className="text-sm text-gray-600">
          Your CSV should include these columns:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
          <li>Email (required)</li>
          <li>First Name (required)</li>
          <li>Company Name</li>
          <li>Website</li>
          <li>LinkedIn Profile</li>
          <li>Job Title</li>
          <li>Notes</li>
          <li>Source</li>
        </ul>
      </div>
    </div>
  );
};