import React, { useState } from 'react';
import ScoreCardGrid         from './ScoreCardGrid';
import RadarComparisonChart  from './RadarComparisonChart';
import BarComparisonChart    from './BarComparisonChart';
import PieBreakdownChart     from './PieBreakdownChart';
import SimilarityHeatmap     from './SimilarityHeatmap';
import TrendTimeline         from './TrendTimeline';
import TagCloud              from './TagCloud';
import SentimentGauge        from './SentimentGauge';
import AttributeHistogram    from './AttributeHistogram';
import RepresentativeVideoList from './RepresentativeVideoList';

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between py-1.5 text-left group"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
          {title}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-2 space-y-3">{children}</div>}
    </div>
  );
}

export default function DynamicVisualizationRenderer({ data }) {
  const viz      = data?.vizData || {};
  const countries = (data?.countries || []).map(c => c.country);

  const {
    radarData, barCharts, pieCharts, heatmapData, timelineData,
    tagCloudData, sentimentData, scoreCards, representativeVideos, attributeHistogram,
  } = viz;

  const hasVizData = Object.keys(viz).length > 0;

  if (!hasVizData) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-gray-500 text-sm">No visualization data available.</p>
        <p className="text-gray-600 text-xs mt-1">Try running the analysis again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>

      {/* KPI Cards — always first */}
      {scoreCards?.length > 0 && (
        <Section title="Intelligence Summary">
          <ScoreCardGrid cards={scoreCards} />
        </Section>
      )}

      {/* Radar chart */}
      {radarData?.length > 0 && countries.length > 0 && (
        <Section title="Multi-Dimensional Comparison">
          <RadarComparisonChart data={radarData} countries={countries} />
        </Section>
      )}

      {/* Bar charts */}
      {barCharts?.length > 0 && (
        <Section title="Attribute Count Breakdown">
          <BarComparisonChart charts={barCharts} />
        </Section>
      )}

      {/* Similarity heatmap */}
      {heatmapData?.countries?.length >= 2 && (
        <Section title="Country Similarity Matrix">
          <SimilarityHeatmap data={heatmapData} />
        </Section>
      )}

      {/* Sentiment */}
      {sentimentData && Object.keys(sentimentData).length > 0 && (
        <Section title="Sentiment Analysis">
          <SentimentGauge data={sentimentData} />
        </Section>
      )}

      {/* Pie charts */}
      {pieCharts?.length > 0 && (
        <Section title="Category Distribution" defaultOpen={false}>
          <PieBreakdownChart charts={pieCharts} />
        </Section>
      )}

      {/* Timeline */}
      {timelineData?.length > 0 && countries.length > 0 && (
        <Section title="Content Timeline" defaultOpen={false}>
          <TrendTimeline data={timelineData} countries={countries} />
        </Section>
      )}

      {/* Attribute histogram */}
      {attributeHistogram?.length > 0 && (
        <Section title="Attribute Frequency" defaultOpen={false}>
          <AttributeHistogram data={attributeHistogram} />
        </Section>
      )}

      {/* Tag cloud */}
      {tagCloudData?.length > 0 && (
        <Section title="Keyword Intelligence" defaultOpen={false}>
          <TagCloud data={tagCloudData} />
        </Section>
      )}

      {/* Representative videos */}
      {representativeVideos?.length > 0 && (
        <Section title="Representative Videos" defaultOpen={false}>
          <RepresentativeVideoList videos={representativeVideos} />
        </Section>
      )}
    </div>
  );
}
