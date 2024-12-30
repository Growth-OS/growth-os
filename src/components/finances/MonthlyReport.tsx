import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const MonthlyReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Get previous month's date range
      const previousMonth = subMonths(new Date(), 1);
      const startDate = startOfMonth(previousMonth);
      const endDate = endOfMonth(previousMonth);

      // Fetch transactions with attachments
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          transaction_attachments (
            id,
            file_name,
            file_path
          )
        `)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        toast.error('No transactions found for the previous month');
        return;
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      // Add cover page
      const coverPage = pdfDoc.addPage();
      const { width, height } = coverPage.getSize();
      
      coverPage.drawText('Monthly Financial Report', {
        x: 50,
        y: height - 100,
        size: 24,
        font: boldFont,
      });

      coverPage.drawText(format(previousMonth, 'MMMM yyyy'), {
        x: 50,
        y: height - 140,
        size: 18,
        font: timesRomanFont,
      });

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netIncome = totalIncome - totalExpenses;

      // Add summary
      coverPage.drawText(`Total Income: €${totalIncome.toFixed(2)}`, {
        x: 50,
        y: height - 200,
        size: 12,
        font: timesRomanFont,
      });

      coverPage.drawText(`Total Expenses: €${totalExpenses.toFixed(2)}`, {
        x: 50,
        y: height - 220,
        size: 12,
        font: timesRomanFont,
      });

      coverPage.drawText(`Net Income: €${netIncome.toFixed(2)}`, {
        x: 50,
        y: height - 240,
        size: 12,
        font: timesRomanFont,
      });

      // Add transactions page
      const transactionsPage = pdfDoc.addPage();
      
      transactionsPage.drawText('Transactions', {
        x: 50,
        y: height - 50,
        size: 18,
        font: boldFont,
      });

      let yPosition = height - 80;
      const lineHeight = 20;

      // Add transactions with attachments
      for (const transaction of transactions) {
        // Add new page if needed
        if (yPosition < 50) {
          const newPage = pdfDoc.addPage();
          yPosition = height - 50;
        }

        const transactionText = `${format(new Date(transaction.date), 'yyyy-MM-dd')} - ${
          transaction.type
        } - €${Number(transaction.amount).toFixed(2)} - ${transaction.description || 'No description'}`;

        transactionsPage.drawText(transactionText, {
          x: 50,
          y: yPosition,
          size: 10,
          font: timesRomanFont,
        });

        yPosition -= lineHeight;

        // List and embed attachments if any
        if (transaction.transaction_attachments && transaction.transaction_attachments.length > 0) {
          for (const attachment of transaction.transaction_attachments) {
            try {
              // Download attachment
              const { data: fileData, error: downloadError } = await supabase.storage
                .from('financial_docs')
                .download(attachment.file_path);

              if (downloadError) throw downloadError;

              // Convert attachment to bytes
              const attachmentBytes = await fileData.arrayBuffer();

              // Embed attachment in PDF
              const attachmentPage = pdfDoc.addPage();
              attachmentPage.drawText(`Attachment: ${attachment.file_name}`, {
                x: 50,
                y: height - 50,
                size: 12,
                font: boldFont,
              });

              attachmentPage.drawText(`For transaction: ${format(new Date(transaction.date), 'yyyy-MM-dd')} - ${transaction.description || 'No description'}`, {
                x: 50,
                y: height - 70,
                size: 10,
                font: timesRomanFont,
              });

              // List attachment in transaction page
              transactionsPage.drawText(`   • ${attachment.file_name}`, {
                x: 70,
                y: yPosition,
                size: 10,
                font: timesRomanFont,
              });

              yPosition -= lineHeight;
            } catch (error) {
              console.error('Error processing attachment:', error);
              // Continue with next attachment if one fails
            }
          }
        }

        yPosition -= lineHeight;
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${format(previousMonth, 'yyyy-MM')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Monthly report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate monthly report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generateReport} 
      disabled={isGenerating}
    >
      <FileText className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Monthly Report'}
    </Button>
  );
};