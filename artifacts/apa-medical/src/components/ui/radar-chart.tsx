import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { DomainScores } from "@workspace/api-client-react";

interface ClinicalRadarChartProps {
  scores: DomainScores;
}

export function ClinicalRadarChart({ scores }: ClinicalRadarChartProps) {
  const data = [
    { subject: 'Force', A: scores.strength, fullMark: 100 },
    { subject: 'Endurance', A: scores.endurance, fullMark: 100 },
    { subject: 'Mobilité', A: scores.mobility, fullMark: 100 },
    { subject: 'État Psycho.', A: scores.psychologicalState, fullMark: 100 },
    { subject: 'Tol. Effort', A: scores.effortTolerance, fullMark: 100 },
    { subject: 'Risque Clin.', A: scores.clinicalRisk, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid gridType="polygon" stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar
            name="Score Fonctionnel"
            dataKey="A"
            stroke="#0d9488"
            fill="#0d9488"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
