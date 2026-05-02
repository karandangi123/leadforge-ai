"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a professional font if needed, but standard fonts are safer for now
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece3',
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e2521',
  },
  reportTitle: {
    fontSize: 12,
    color: '#687169',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e2521',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  kpiCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fcfbf9',
    borderWidth: 1,
    borderColor: '#d9d2c1',
    borderRadius: 8,
    marginRight: 10,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#176b5d',
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 8,
    color: '#687169',
    textTransform: 'uppercase',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#f0ece3',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece3',
  },
  tableColHeader: {
    width: '25%',
    backgroundColor: '#fcfbf9',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e2521',
  },
  tableCell: {
    fontSize: 9,
    color: '#4f5a53',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f0ece3',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#a39b8b',
  }
});

interface ReportData {
  companyName: string;
  clientName: string;
  period: string;
  metrics: {
    totalSent: number;
    openRate: string;
    clickRate: string;
    replyRate: string;
    meetings: number;
  };
  campaigns: Array<{
    name: string;
    sent: number;
    openRate: string;
    replyRate: string;
  }>;
}

export const PerformanceReport = ({ data }: { data: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.companyName}>{data.companyName}</Text>
        </View>
        <Text style={styles.reportTitle}>Performance Report</Text>
      </View>

      {/* Summary Info */}
      <View style={styles.section}>
        <Text style={{ fontSize: 12, color: '#1e2521', marginBottom: 5 }}>Prepared for: <Text style={{ fontWeight: 'bold' }}>{data.clientName}</Text></Text>
        <Text style={{ fontSize: 10, color: '#687169' }}>Reporting Period: {data.period}</Text>
      </View>

      {/* KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{data.metrics.openRate}</Text>
            <Text style={styles.kpiLabel}>Avg Open Rate</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{data.metrics.clickRate}</Text>
            <Text style={styles.kpiLabel}>Avg Click Rate</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{data.metrics.replyRate}</Text>
            <Text style={styles.kpiLabel}>Avg Reply Rate</Text>
          </View>
          <View style={[styles.kpiCard, { marginRight: 0 }]}>
            <Text style={styles.kpiValue}>{data.metrics.meetings}</Text>
            <Text style={styles.kpiLabel}>Meetings Booked</Text>
          </View>
        </View>
      </View>

      {/* Campaigns Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaign Breakdown</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Sequence Name</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Sent</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Open Rate</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Reply Rate</Text></View>
          </View>
          {/* Table Rows */}
          {data.campaigns.map((c, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{c.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{c.sent}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{c.openRate}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{c.replyRate}</Text></View>
            </View>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strategic Insights</Text>
        <Text style={{ fontSize: 10, color: '#4f5a53', lineHeight: 1.5 }}>
          Your outbound performance remains above industry benchmarks. The transition to AI-personalized dossiers has resulted in a marked increase in positive reply sentiment. We recommend scaling the "Enterprise Outreach" sequence while continuing to optimize the value proposition for the mid-market segment.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated by LeadForge AI</Text>
        <Text style={styles.footerText}>Confidential - {new Date().getFullYear()}</Text>
      </View>
    </Page>
  </Document>
);
