import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useApp } from '../../context/AppContext';

interface CountryData {
  country: string;
  latitude: number;
  longitude: number;
  videoCount: number;
  videos: any[];
  summary?: Record<string, any>;
}

interface AnalysisData {
  query: string;
  domain: string;
  countries: CountryData[];
  comparison?: Record<string, any>;
  vizData?: Record<string, any>;
}

const TABS = [
  { id: 'visualizations', label: 'Visuals', badge: 'NEW' },
  { id: 'overview', label: 'Overview' },
  { id: 'comparison', label: 'Matrix' },
  { id: 'similarities', label: 'Common' },
  { id: 'differences', label: 'Contrast' },
  { id: 'askai', label: 'Ask AI' },
];

const COUNTRY_COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15', '#c084fc', '#fb923c'];
const CHART_CONFIG = {
  backgroundGradientFrom: '#111827',
  backgroundGradientTo: '#111827',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 208, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`,
  propsForBackgroundLines: {
    stroke: 'rgba(255,255,255,0.08)',
  },
  propsForLabels: {
    fontSize: 10,
  },
};

export default function AnalysisDashboard() {
  const { state } = useApp();
  const { analysisData, analysisError } = state;
  const [activeTab, setActiveTab] = useState('visualizations');

  if (analysisError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>Analysis failed</Text>
        <Text style={styles.errorMessage}>{analysisError}</Text>
      </View>
    );
  }

  if (!analysisData) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'visualizations':
        return <VisualizationsTab data={analysisData} />;
      case 'overview':
        return <OverviewTab data={analysisData} />;
      case 'comparison':
        return <ComparisonTab data={analysisData} />;
      case 'similarities':
        return <BulletListTab data={analysisData} kind="similarities" />;
      case 'differences':
        return <BulletListTab data={analysisData} kind="differences" />;
      case 'askai':
        return <AskAITab data={analysisData} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.pulse} />
          <Text style={styles.title}>Intelligence Dashboard</Text>
        </View>
        <Text style={styles.domain}>{analysisData.domain || 'general'}</Text>
      </View>

      <Text style={styles.subtitle} numberOfLines={2}>
        {'"'}{analysisData.query}{'"'} - {analysisData.countries?.length || 0} countries
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabStrip}
        contentContainerStyle={styles.tabStripContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {tab.badge && <Text style={styles.tabBadge}>{tab.badge}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTab()}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.legendTitle}>Countries</Text>
        <View style={styles.legendItems}>
          {(analysisData.countries || []).map((c, i) => (
            <View key={c.country} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }]} />
              <Text style={styles.legendText}>{c.country}</Text>
              <Text style={styles.legendCount}>({c.videoCount})</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function VisualizationsTab({ data }: { data: AnalysisData }) {
  const viz = data.vizData || {};
  const countries = data.countries || [];
  const chartWidth = Math.max(260, Dimensions.get('window').width * 0.4 - 64);
  const firstBarChart = Array.isArray(viz.barCharts) ? viz.barCharts[0] : null;
  const firstPieChart = Array.isArray(viz.pieCharts) ? viz.pieCharts[0] : null;

  if (Object.keys(viz).length === 0) {
    return (
      <EmptyState
        title="No visualization data yet"
        message="Run the analysis again after the backend finishes building chart payloads."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {Array.isArray(viz.scoreCards) && viz.scoreCards.length > 0 && (
        <Section title="Intelligence Summary">
          <View style={styles.scoreGrid}>
            {viz.scoreCards.map((card: any) => (
              <View key={card.label} style={styles.scoreCard}>
                <Text style={styles.scoreValue} numberOfLines={1}>{card.value}</Text>
                <Text style={styles.scoreLabel}>{card.label}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {firstBarChart?.data?.length > 0 && (
        <Section title={firstBarChart.title || 'Attribute Count Breakdown'}>
          <ChartFrame>
            <BarChart
              data={{
                labels: firstBarChart.data.map((item: any) => shortLabel(item.country)),
                datasets: [{ data: firstBarChart.data.map((item: any) => Number(item.value) || 0) }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={CHART_CONFIG}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </ChartFrame>
        </Section>
      )}

      {viz.heatmapData?.countries?.length >= 2 && (
        <Section title="Country Similarity Matrix">
          <Heatmap data={viz.heatmapData} />
        </Section>
      )}

      {viz.sentimentData && Object.keys(viz.sentimentData).length > 0 && (
        <Section title="Sentiment Analysis">
          <SentimentBars data={viz.sentimentData} />
        </Section>
      )}

      {firstPieChart?.data?.length > 0 && (
        <Section title={firstPieChart.title || 'Category Distribution'}>
          <ChartFrame>
            <PieChart
              data={firstPieChart.data.map((item: any, index: number) => ({
                name: String(item.name),
                population: Number(item.value) || 0,
                color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
                legendFontColor: '#d1d5db',
                legendFontSize: 11,
              }))}
              width={chartWidth}
              height={210}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
              chartConfig={CHART_CONFIG}
              absolute
            />
          </ChartFrame>
        </Section>
      )}

      {Array.isArray(viz.tagCloudData) && viz.tagCloudData.length > 0 && (
        <Section title="Keyword Intelligence">
          <TagCloud data={viz.tagCloudData} />
        </Section>
      )}

      {Array.isArray(viz.representativeVideos) && viz.representativeVideos.length > 0 && (
        <Section title="Representative Videos">
          {viz.representativeVideos.map((video: any) => (
            <VideoRow key={`${video.country}-${video.videoId}`} video={video} />
          ))}
        </Section>
      )}

      {countries.length > 0 && !firstBarChart && (
        <Section title="Video Coverage">
          <SimpleBars
            rows={countries.map(c => ({
              label: c.country,
              value: c.videoCount,
              color: COUNTRY_COLORS[countries.indexOf(c) % COUNTRY_COLORS.length],
            }))}
          />
        </Section>
      )}
    </View>
  );
}

function OverviewTab({ data }: { data: AnalysisData }) {
  const overview = Array.isArray(data.comparison?.overview) ? data.comparison?.overview : [];

  return (
    <View style={styles.tabContent}>
      <View style={styles.badgeRow}>
        <Text style={styles.domainBadge}>{data.domain || 'general'}</Text>
        <Text style={styles.mutedText}>{data.countries?.length || 0} countries compared</Text>
      </View>

      {(data.countries || []).map((country, index) => (
        <View key={country.country} style={styles.countryCard}>
          <View style={styles.countryHeader}>
            <View style={[styles.legendDot, { backgroundColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length] }]} />
            <Text style={styles.countryTitle}>{country.country}</Text>
            <Text style={styles.countryCount}>
              {country.videoCount} video{country.videoCount === 1 ? '' : 's'}
            </Text>
          </View>

          {overview[index] && <Text style={styles.quoteText}>{'"'}{overview[index]}{'"'}</Text>}

          <View style={styles.attributeGrid}>
            {Object.entries(country.summary || {}).slice(0, 6).map(([key, value]) => {
              const display = Array.isArray(value) ? value.slice(0, 3).join(', ') : String(value || '');
              if (!display) return null;
              return (
                <View key={key} style={styles.attributeCard}>
                  <Text style={styles.attributeLabel}>{formatKey(key)}</Text>
                  <Text style={styles.attributeValue} numberOfLines={2}>{display}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function ComparisonTab({ data }: { data: AnalysisData }) {
  const table = data.vizData?.comparisonTable;
  const countries = data.countries || [];
  const rows = table?.rows || buildComparisonRows(countries);
  const headers = table?.headers || countries.map(c => c.country);

  if (rows.length === 0) {
    return <EmptyState title="No structured attributes" message="The analysis did not return comparable summary fields." />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.matrix}>
        <View style={styles.matrixRow}>
          <Text style={[styles.matrixCell, styles.matrixAttribute]}>Attribute</Text>
          {headers.map((header: string) => (
            <Text key={header} style={[styles.matrixCell, styles.matrixHeader]}>{header}</Text>
          ))}
        </View>
        {rows.map((row: any, index: number) => (
          <View key={`${row.attribute}-${index}`} style={[styles.matrixRow, index % 2 === 1 && styles.matrixAltRow]}>
            <Text style={[styles.matrixCell, styles.matrixAttribute]}>{row.attribute}</Text>
            {headers.map((header: string) => (
              <Text key={header} style={styles.matrixCell} numberOfLines={4}>
                {renderMatrixValue(row[header])}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function BulletListTab({ data, kind }: { data: AnalysisData; kind: 'similarities' | 'differences' }) {
  const items = Array.isArray(data.comparison?.[kind]) ? data.comparison?.[kind] : [];
  const isSimilarities = kind === 'similarities';

  if (items.length === 0) {
    return (
      <EmptyState
        title={isSimilarities ? 'No similarities detected' : 'No differences detected'}
        message="The backend did not return narrative points for this tab."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionText}>
        {isSimilarities
          ? `Traits that appear across ${data.countries?.length || 'all'} countries.`
          : "Contrasting traits that distinguish each country's approach."}
      </Text>
      {items.map((item: string, index: number) => (
        <View
          key={`${kind}-${index}`}
          style={[styles.bulletCard, isSimilarities ? styles.similarityCard : styles.differenceCard]}
        >
          <Text style={[styles.bulletMarker, isSimilarities ? styles.similarityMarker : styles.differenceMarker]}>
            {isSimilarities ? '+' : '>'}
          </Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function AskAITab({ data }: { data: AnalysisData }) {
  return (
    <View style={styles.tabContent}>
      <Section title="Ask AI">
        <Text style={styles.sectionText}>
          The mobile chat surface is ready for the analysis context, but the input flow still needs to be connected
          to the backend chat endpoint.
        </Text>
        <View style={styles.suggestionGrid}>
          {[
            'Why is each country different?',
            'What do all countries have in common?',
            'Which country has the most unique approach?',
          ].map(question => (
            <View key={question} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{question}</Text>
            </View>
          ))}
        </View>
      </Section>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <View style={styles.chartFrame}>{children}</View>;
}

function Heatmap({ data }: { data: any }) {
  const countries: string[] = data.countries || [];
  const matrix: number[][] = data.matrix || [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.heatmapRow}>
          <Text style={styles.heatmapAxis} />
          {countries.map(country => (
            <Text key={country} style={styles.heatmapAxis}>{shortLabel(country)}</Text>
          ))}
        </View>
        {countries.map((country, rowIndex) => (
          <View key={country} style={styles.heatmapRow}>
            <Text style={styles.heatmapAxis}>{shortLabel(country)}</Text>
            {countries.map((_, colIndex) => {
              const score = Number(matrix[rowIndex]?.[colIndex]) || 0;
              return (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[styles.heatmapCell, { backgroundColor: similarityColor(score) }]}
                >
                  <Text style={styles.heatmapText}>{score}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SentimentBars({ data }: { data: any }) {
  const rows = Object.entries(data).map(([country, value]: [string, any], index) => ({
    label: country,
    value: Number(value?.positive) || 0,
    color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
  }));

  return (
    <View>
      <Text style={styles.caption}>Positive signal by country</Text>
      <SimpleBars rows={rows} suffix="%" />
    </View>
  );
}

function SimpleBars({ rows, suffix = '' }: { rows: { label: string; value: number; color: string }[]; suffix?: string }) {
  const max = Math.max(1, ...rows.map(row => row.value));

  return (
    <View style={styles.simpleBars}>
      {rows.map(row => (
        <View key={row.label} style={styles.simpleBarRow}>
          <Text style={styles.simpleBarLabel} numberOfLines={1}>{row.label}</Text>
          <View style={styles.simpleBarTrack}>
            <View style={[styles.simpleBarFill, { width: `${(row.value / max) * 100}%`, backgroundColor: row.color }]} />
          </View>
          <Text style={styles.simpleBarValue}>{row.value}{suffix}</Text>
        </View>
      ))}
    </View>
  );
}

function TagCloud({ data }: { data: any[] }) {
  const max = Math.max(1, ...data.map(item => Number(item.value) || 0));

  return (
    <View style={styles.tagCloud}>
      {data.slice(0, 18).map((item, index) => {
        const value = Number(item.value) || 0;
        return (
          <View key={`${item.text}-${index}`} style={styles.tag}>
            <Text style={[styles.tagText, { fontSize: 11 + (value / max) * 5 }]}>{item.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

function VideoRow({ video }: { video: any }) {
  const thumbnail = video.thumbnail || video.thumbnailUrl;

  return (
    <View style={styles.videoRow}>
      {thumbnail && <Image source={{ uri: thumbnail }} style={styles.videoThumb} />}
      <View style={styles.videoMeta}>
        <Text style={styles.videoCountry}>{video.country}</Text>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title || 'Representative video'}</Text>
      </View>
    </View>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

function buildComparisonRows(countries: CountryData[]) {
  const keys = Object.keys(countries[0]?.summary || {});
  return keys.map(key => {
    const row: Record<string, string> = { attribute: formatKey(key) };
    countries.forEach(country => {
      row[country.country] = renderMatrixValue(country.summary?.[key]);
    });
    return row;
  });
}

function renderMatrixValue(value: any) {
  if (!value || (Array.isArray(value) && value.length === 0)) return '-';
  if (Array.isArray(value)) return value.slice(0, 3).join(', ');
  return String(value);
}

function formatKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function shortLabel(label: string) {
  return label.length > 10 ? `${label.slice(0, 9)}.` : label;
}

function similarityColor(score: number) {
  if (score >= 80) return 'rgba(34,197,94,0.65)';
  if (score >= 60) return 'rgba(0,208,255,0.55)';
  if (score >= 40) return 'rgba(250,204,21,0.48)';
  return 'rgba(248,113,113,0.45)';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(5,8,16,0.97)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d0ff',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  domain: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(192,132,252,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 8,
  },
  tabStrip: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabStripContent: {
    paddingHorizontal: 8,
  },
  tab: {
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    gap: 5,
  },
  activeTab: {
    borderBottomColor: '#00d0ff',
  },
  tabLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: 'white',
  },
  tabBadge: {
    color: '#67e8f9',
    fontSize: 8,
    fontWeight: '800',
    backgroundColor: 'rgba(6,182,212,0.18)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tabContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreCard: {
    width: '47%',
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    justifyContent: 'center',
  },
  scoreValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 15,
  },
  chartFrame: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111827',
    overflow: 'hidden',
    paddingVertical: 8,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heatmapAxis: {
    width: 58,
    color: '#9ca3af',
    fontSize: 10,
    marginRight: 6,
    textAlign: 'center',
  },
  heatmapCell: {
    width: 48,
    height: 38,
    borderRadius: 6,
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  caption: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 8,
  },
  simpleBars: {
    gap: 10,
  },
  simpleBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simpleBarLabel: {
    width: 82,
    color: '#d1d5db',
    fontSize: 12,
  },
  simpleBarTrack: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  simpleBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  simpleBarValue: {
    width: 36,
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,208,255,0.18)',
    backgroundColor: 'rgba(0,208,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#a5f3fc',
    fontWeight: '700',
  },
  videoRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
  },
  videoThumb: {
    width: 82,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  videoMeta: {
    flex: 1,
  },
  videoCountry: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  videoTitle: {
    color: '#e5e7eb',
    fontSize: 12,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  domainBadge: {
    color: '#d8b4fe',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    backgroundColor: 'rgba(192,132,252,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  mutedText: {
    color: '#6b7280',
    fontSize: 12,
  },
  countryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    marginBottom: 12,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  countryTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  countryCount: {
    color: '#6b7280',
    fontSize: 11,
  },
  quoteText: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  attributeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attributeCard: {
    width: '48%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 8,
  },
  attributeLabel: {
    color: '#6b7280',
    fontSize: 10,
    marginBottom: 3,
  },
  attributeValue: {
    color: '#e5e7eb',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  matrix: {
    paddingBottom: 20,
  },
  matrixRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  matrixAltRow: {
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  matrixCell: {
    width: 118,
    color: '#d1d5db',
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  matrixAttribute: {
    width: 104,
    color: '#9ca3af',
    fontWeight: '700',
  },
  matrixHeader: {
    color: 'white',
    fontWeight: '800',
  },
  bulletCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  similarityCard: {
    backgroundColor: 'rgba(0,210,255,0.06)',
    borderColor: 'rgba(0,210,255,0.16)',
  },
  differenceCard: {
    backgroundColor: 'rgba(248,113,113,0.06)',
    borderColor: 'rgba(248,113,113,0.18)',
  },
  bulletMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '900',
    overflow: 'hidden',
  },
  similarityMarker: {
    color: '#67e8f9',
    backgroundColor: 'rgba(0,210,255,0.18)',
  },
  differenceMarker: {
    color: '#fca5a5',
    backgroundColor: 'rgba(248,113,113,0.18)',
  },
  bulletText: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 19,
  },
  suggestionGrid: {
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.24)',
    backgroundColor: 'rgba(192,132,252,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: {
    color: '#d8b4fe',
    fontSize: 12,
  },
  emptyState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyMessage: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  legendTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  legendCount: {
    color: '#6b7280',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    color: '#f87171',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  errorTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});
