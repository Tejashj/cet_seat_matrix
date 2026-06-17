'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { PredictionResult, StudentInput, Recommendation } from '@/lib/prediction/engine';
import { FileDown } from 'lucide-react';

// Register font
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '2 solid #4f46e5',
  },
  headerLeft: {},
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#eef2ff',
    padding: '4 10',
    borderRadius: 20,
    fontSize: 8,
    color: '#4338ca',
    fontFamily: 'Helvetica-Bold',
  },
  studentBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  studentField: {
    flexDirection: 'column',
    minWidth: 100,
  },
  studentLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  studentValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tierBox: {
    flex: 1,
    padding: '8 10',
    borderRadius: 6,
    alignItems: 'center',
  },
  tierCount: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
    marginBottom: 2,
  },
  tierLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    padding: '6 8',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: 'white',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7 8',
    borderBottom: '1 solid #f1f5f9',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '7 8',
    backgroundColor: '#f9fafb',
    borderBottom: '1 solid #f1f5f9',
  },
  cell: {
    fontSize: 8,
    color: '#374151',
  },
  cellBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  tierPill: {
    borderRadius: 10,
    padding: '1 5',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 6,
    fontSize: 7,
    color: '#9ca3af',
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    marginTop: 2,
  },
  confidenceFill: {
    height: 4,
    borderRadius: 2,
  },
});

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  Dream:     { bg: '#fef2f2', text: '#dc2626' },
  Realistic: { bg: '#fffbeb', text: '#d97706' },
  Safe:      { bg: '#ecfdf5', text: '#059669' },
  Reach:     { bg: '#f5f3ff', text: '#7c3aed' },
};

interface PDFDocProps {
  predictions: PredictionResult;
  studentInput: StudentInput;
  exportList: Recommendation[];
}

const RecommendationDocument = ({ predictions, studentInput, exportList }: PDFDocProps) => (
  <Document
    title={`KCET Option Entry - Rank ${studentInput.rank} - ${studentInput.category}`}
    author="KCET Option Entry Planner Pro"
    subject="KCET College Recommendations"
  >
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>KCET Option Entry Planner</Text>
          <Text style={styles.subtitle}>
            Personalized Recommendation Report • Generated {new Date().toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text>AI-POWERED • 6-YEAR DATA</Text>
        </View>
      </View>

      {/* Student info */}
      <View style={styles.studentBox}>
        {[
          ['KCET Rank', studentInput.rank.toLocaleString('en-IN')],
          ['Category', studentInput.category],
          ['Gender', studentInput.gender ?? 'Not specified'],
          ['Quotas', [
            studentInput.rural && 'Rural',
            studentInput.kannadaMedium && 'Kannada Medium',
            studentInput.ph && 'PH',
            studentInput.exDefence && 'Ex-Defence',
          ].filter(Boolean).join(', ') || 'None'],
          ['Confidence', `${Math.round(predictions.overallConfidence * 100)}%`],
          ['Total Options', predictions.totalRecommendations.toString()],
        ].map(([label, value]) => (
          <View key={label as string} style={styles.studentField}>
            <Text style={styles.studentLabel}>{label}</Text>
            <Text style={styles.studentValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Tier summary */}
      <Text style={styles.sectionTitle}>Recommendation Summary</Text>
      <View style={styles.tierRow}>
        {[
          { tier: 'Dream', count: predictions.dreamColleges.length },
          { tier: 'Realistic', count: predictions.realisticColleges.length },
          { tier: 'Safe', count: predictions.safeColleges.length },
          { tier: 'Reach', count: predictions.reachColleges.length },
        ].map(({ tier, count }) => (
          <View key={tier} style={[styles.tierBox, { backgroundColor: TIER_COLORS[tier].bg }]}>
            <Text style={[styles.tierCount, { color: TIER_COLORS[tier].text }]}>{count}</Text>
            <Text style={[styles.tierLabel, { color: TIER_COLORS[tier].text }]}>{tier}</Text>
          </View>
        ))}
      </View>

      {/* Table */}
      <Text style={styles.sectionTitle}>
        {exportList.length === predictions.recommendations.length
          ? 'Complete Recommendation List'
          : `Your Option Entry List (${exportList.length} options)`}
      </Text>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>#</Text>
        <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Code</Text>
        <Text style={[styles.tableHeaderText, { flex: 2.5 }]}>College</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Branch</Text>
        <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Tier</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Cutoff</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Conf.</Text>
      </View>

      {/* Table rows */}
      {exportList.slice(0, 40).map((rec, index) => (
        <View key={rec.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <Text style={[styles.cell, { flex: 0.4 }]}>{index + 1}</Text>
          <Text style={[styles.cellBold, { flex: 0.8 }]}>{rec.collegeCode}</Text>
          <View style={{ flex: 2.5 }}>
            <Text style={[styles.cellBold]}>{rec.collegeName.slice(0, 45)}</Text>
            <Text style={[styles.cell, { fontSize: 6.5, color: '#9ca3af' }]}>{rec.city} • {rec.naac}</Text>
          </View>
          <Text style={[styles.cell, { flex: 1.5 }]}>{rec.branchShortName}</Text>
          <View style={{ flex: 0.8 }}>
            <Text style={[styles.tierPill, {
              backgroundColor: TIER_COLORS[rec.tier].bg,
              color: TIER_COLORS[rec.tier].text,
            }]}>
              {rec.tier}
            </Text>
          </View>
          <Text style={[styles.cell, { flex: 1 }]}>{rec.predictedCutoff.toLocaleString('en-IN')}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{Math.round(rec.confidenceScore * 100)}%</Text>
        </View>
      ))}

      {exportList.length > 40 && (
        <Text style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
          * Showing first 40 options. View complete list in the app.
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>KCET Option Entry Planner Pro v2.0</Text>
        <Text>For educational guidance only. Verify with KEA official website.</Text>
        <Text>Generated: {new Date().toLocaleDateString('en-IN')}</Text>
      </View>
    </Page>
  </Document>
);

interface Props {
  predictions: PredictionResult;
  studentInput: StudentInput;
  exportList: Recommendation[];
}

export default function PDFDownloadButton({ predictions, studentInput, exportList }: Props) {
  const fileName = `KCET-Options-Rank${studentInput.rank}-${studentInput.category}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <PDFDownloadLink
      document={<RecommendationDocument predictions={predictions} studentInput={studentInput} exportList={exportList} />}
      fileName={fileName}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ loading, error }) => (
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={{ animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }}>⏳</span>
              Generating PDF...
            </>
          ) : error ? (
            <>❌ Error generating PDF</>
          ) : (
            <>
              <FileDown size={18} />
              Download PDF Report
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
