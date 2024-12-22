import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Users, Percent, TrendingUp } from "lucide-react";
import { AffiliateForm } from "@/components/affiliates/AffiliateForm";

const Affiliates = () => {
  const affiliates = [
    {
      name: "PartnerStack",
      contact: "John Doe",
      manager: "Sarah Smith",
      program: "Growth Pro",
      commissionRate: "30%",
      status: "Active",
      earnings: "$1,500",
    },
    {
      name: "Impact",
      contact: "Jane Wilson",
      manager: "Mike Johnson",
      program: "Impact Elite",
      commissionRate: "25%",
      status: "Active",
      earnings: "$2,300",
    },
  ];

  const stats = [
    {
      title: "Total Partners",
      value: "12",
      trend: "+2 this month",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Campaigns",
      value: "8",
      trend: "5 pending review",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Monthly Earnings",
      value: "$3,800",
      trend: "+15% vs last month",
      icon: DollarSign,
      color: "text-purple-500",
    },
    {
      title: "Avg. Commission",
      value: "27.5%",
      trend: "Industry avg: 25%",
      icon: Percent,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Affiliate Partners</h1>
          <p className="text-gray-600">Manage your affiliate relationships and track performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
            </DialogHeader>
            <AffiliateForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-gray-600 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{affiliate.name}</TableCell>
                  <TableCell>{affiliate.contact}</TableCell>
                  <TableCell>{affiliate.program}</TableCell>
                  <TableCell>{affiliate.commissionRate}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {affiliate.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{affiliate.earnings}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Affiliates;