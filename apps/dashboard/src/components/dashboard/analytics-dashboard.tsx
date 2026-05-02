"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  MailOpen, 
  MousePointerClick, 
  MessageSquareReply, 
  Calendar,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  Activity,
  UserCheck
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PerformanceReport } from "./report-template";

interface AnalyticsDashboardProps {
  metrics: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    meetingsBooked: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    meetings: number;
  }>;
}

export function AnalyticsDashboard({ metrics, campaigns }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d");

  // Format rates
  const openRate = metrics.totalSent > 0 ? (metrics.totalOpened / metrics.totalSent) * 100 : 0;
  const clickRate = metrics.totalOpened > 0 ? (metrics.totalClicked / metrics.totalOpened) * 100 : 0;
  const replyRate = metrics.totalSent > 0 ? (metrics.totalReplied / metrics.totalSent) * 100 : 0;

  // Mock time-series data for the advanced chart
  const mockChartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const baseOpens = Math.floor(Math.random() * 50) + 20 + (i * 2);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      opens: baseOpens,
      clicks: Math.floor(baseOpens * 0.4),
      replies: Math.floor(baseOpens * 0.1),
    };
  });

  const channelData = [
    { name: 'Email', value: 65, color: '#3b82f6' },
    { name: 'LinkedIn', value: 25, color: '#0077b5' },
    { name: 'SMS', value: 10, color: '#176b5d' },
  ];

  const bookedMeetings = [
    { id: '1', contact: 'Sarah Miller', company: 'Nexus AI', date: 'Oct 14, 2:00 PM', sequence: 'Enterprise Outreach' },
    { id: '2', contact: 'David Chen', company: 'Skyline Ventures', date: 'Oct 16, 10:30 AM', sequence: 'Founder Content' },
    { id: '3', contact: 'Elena Rodriguez', company: 'Oceanic Corp', date: 'Oct 17, 4:00 PM', sequence: 'Enterprise Outreach' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1e2521] flex items-center gap-2">
            <BarChart3 className="text-[#176b5d]" />
            Performance Analytics
          </h2>
          <p className="mt-1 text-sm text-[#687169]">
            Track open rates, clicks, replies, and revenue-generating meetings booked.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#d9d2c1] bg-white text-[#1e2521] text-sm font-bold shadow-sm outline-none hover:border-[#176b5d]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#d9d2c1] bg-white text-[#1e2521] text-sm font-bold shadow-sm hover:border-[#176b5d] transition-colors">
            <Filter size={16} /> Filters
          </button>
          
          <PDFDownloadLink 
            document={
              <PerformanceReport data={{
                companyName: "LeadForge Agency",
                clientName: "Acme Corp",
                period: "Last 30 Days",
                metrics: {
                  totalSent: metrics.totalSent,
                  openRate: `${openRate.toFixed(1)}%`,
                  clickRate: `${clickRate.toFixed(1)}%`,
                  replyRate: `${replyRate.toFixed(1)}%`,
                  meetings: metrics.meetingsBooked
                },
                campaigns: campaigns.map(c => ({
                  name: c.name,
                  sent: c.sent,
                  openRate: `${c.openRate.toFixed(1)}%`,
                  replyRate: `${c.replyRate.toFixed(1)}%`
                }))
              }} />
            } 
            fileName="leadforge-performance-report.pdf"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1e2521] text-white text-sm font-black shadow-sm hover:bg-black transition-colors"
          >
            {({ loading }) => (
              <>
                <Download size={16} /> 
                {loading ? "Preparing..." : "Export PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Reporting Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard 
              title="Open Rate" 
              value={`${openRate.toFixed(1)}%`} 
              subValue={`${metrics.totalOpened} unique opens`}
              icon={MailOpen} 
              trend="+2.4%" 
              trendUp={true} 
            />
            <KpiCard 
              title="Click Rate" 
              value={`${clickRate.toFixed(1)}%`} 
              subValue={`${metrics.totalClicked} unique clicks`}
              icon={MousePointerClick} 
              trend="-0.8%" 
              trendUp={false} 
            />
            <KpiCard 
              title="Reply Rate" 
              value={`${replyRate.toFixed(1)}%`} 
              subValue={`${metrics.totalReplied} total replies`}
              icon={MessageSquareReply} 
              trend="+1.2%" 
              trendUp={true} 
            />
            <KpiCard 
              title="Meetings Booked" 
              value={metrics.meetingsBooked.toString()} 
              subValue="via integrated calendar"
              icon={Calendar} 
              trend="+4" 
              trendUp={true} 
              highlight 
            />
          </div>

          {/* Engagement Trend Graph */}
          <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-[#1e2521] flex items-center gap-2">
                  <Activity size={16} className="text-[#176b5d]" />
                  Engagement Trends
                </h3>
                <p className="text-xs text-[#687169] mt-1">Daily unique opens, clicks, and replies</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece3" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a39b8b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a39b8b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #d9d2c1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                    labelStyle={{ fontSize: '12px', color: '#687169', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="opens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOpens)" />
                  <Area type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Breakdown */}
            <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm p-6">
              <h3 className="font-black text-[#1e2521] mb-6 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#176b5d]" />
                Channel Effectiveness
              </h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recently Booked Meetings */}
            <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm p-6">
              <h3 className="font-black text-[#1e2521] mb-6 flex items-center gap-2">
                <UserCheck size={16} className="text-[#176b5d]" />
                Recently Booked
              </h3>
              <div className="space-y-4">
                {bookedMeetings.map(meeting => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] border border-[#f0ece3]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white border border-[#d9d2c1] flex items-center justify-center text-[#176b5d] font-bold">
                        {meeting.contact.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#1e2521]">{meeting.contact}</div>
                        <div className="text-[10px] text-[#687169]">{meeting.company}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[#176b5d] uppercase">{meeting.date}</div>
                      <div className="text-[9px] text-[#a39b8b]">{meeting.sequence}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Performance Table */}
          <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-[#f0ece3] bg-[#fcfbf9] px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-[#1e2521]">Campaign Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0ece3] text-xs uppercase tracking-wider text-[#687169] bg-[#fffdf8]">
                    <th className="px-6 py-3 font-bold">Sequence Name</th>
                    <th className="px-6 py-3 font-bold">Sent</th>
                    <th className="px-6 py-3 font-bold">Open Rate</th>
                    <th className="px-6 py-3 font-bold">Click Rate</th>
                    <th className="px-6 py-3 font-bold">Reply Rate</th>
                    <th className="px-6 py-3 font-bold text-right">Meetings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece3]">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#687169]">
                        No active campaigns in this period.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-[#fcfbf9] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#1e2521]">{c.name}</td>
                        <td className="px-6 py-4 text-[#4f5a53]">{c.sent}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1e2521]">{c.openRate.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${c.openRate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1e2521]">{c.clickRate.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${c.clickRate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1e2521]">{c.replyRate.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${c.replyRate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-[#176b5d] text-right">{c.meetings}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Upsell Area */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* White-label Reporting Upsell */}
          <div className="rounded-2xl border-2 border-transparent bg-gradient-to-b from-[#176b5d] to-[#115247] p-1 shadow-lg relative overflow-hidden group">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <div className="bg-[#1e2521] rounded-xl p-5 h-full relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                  <Building2 size={20} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#b9ddcf] bg-[#176b5d]/30 px-2 py-1 rounded-full border border-[#176b5d]">
                  <Lock size={10} /> Pro Feature
                </div>
              </div>
              
              <h3 className="text-lg font-black text-white mb-2">Branded Client Reports</h3>
              <p className="text-xs text-[#a39b8b] leading-relaxed mb-6">
                Generate beautiful, white-labeled PDF performance reports for your agency clients. Add your logo, custom domains, and automated weekly delivery.
              </p>
              
              <button className="w-full h-10 bg-white text-[#1e2521] text-sm font-black rounded-lg hover:bg-[#f7f5ef] transition-colors flex items-center justify-center gap-2">
                Upgrade to Pro <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm p-5">
            <h3 className="font-black text-[#1e2521] mb-4">Quick Insights</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 text-[#4f5a53]">
                <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <span><b className="text-[#1e2521]">"Enterprise RevOps Setup"</b> is your top performing sequence with a 12.4% reply rate.</span>
              </li>
              <li className="flex gap-3 text-[#4f5a53]">
                <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <span>Open rates have increased by 2.4% since adding dynamic personalization snippets.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, subValue, icon: Icon, trend, trendUp, highlight = false }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${highlight ? 'border-[#cfe7de] bg-[#f3faf7]' : 'border-[#d9d2c1] bg-white'} shadow-sm flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#f0ece3] text-[#687169]">
          <Icon size={16} className={highlight ? "text-[#176b5d]" : ""} />
        </div>
        <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          <TrendingUp size={12} className={!trendUp ? "rotate-180" : ""} /> {trend}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-black text-[#1e2521] mb-1">{value}</div>
        <div className="text-xs font-bold text-[#687169] uppercase tracking-wider">{title}</div>
        <div className="text-[10px] text-[#a39b8b] mt-1">{subValue}</div>
      </div>
    </div>
  );
}
