"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Activity,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Zap,
  Brain,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface TrendAnalyzerProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Datos predictivos simulados con algoritmos de análisis avanzado
const generatePredictiveData = () => {
  const now = new Date();
  const trends = [];

  // Generar tendencias para los próximos 30 días
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const baseValue = 100;
    const seasonalFactor = Math.sin((i / 7) * Math.PI) * 20; // Patrón semanal
    const trendFactor = i * 2; // Tendencia creciente
    const randomNoise = (Math.random() - 0.5) * 10; // Ruido aleatorio

    trends.push({
      date: date.toISOString().split("T")[0],
      predicted: Math.max(
        0,
        baseValue + seasonalFactor + trendFactor + randomNoise
      ),
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confianza
      actual:
        i < 7
          ? baseValue + seasonalFactor + i * 1.5 + (Math.random() - 0.5) * 5
          : null,
    });
  }

  return trends;
};

const mockTrendData = {
  conversations: generatePredictiveData(),
  engagement: generatePredictiveData().map((d) => ({
    ...d,
    predicted: d.predicted * 0.8,
  })),
  satisfaction: generatePredictiveData().map((d) => ({
    ...d,
    predicted: Math.min(5, d.predicted * 0.05),
  })),
  responseTime: generatePredictiveData().map((d) => ({
    ...d,
    predicted: Math.max(0.5, 10 - d.predicted * 0.05),
  })),
};

const mockAnomalies = [
  {
    id: "anom_1",
    type: "conversation_spike",
    severity: "medium",
    description: "Unusual conversation volume increase detected",
    predictedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    confidence: 0.85,
    impact: "Expected 40% increase in conversation volume",
    recommendation: "Consider scaling response capacity",
  },
  {
    id: "anom_2",
    type: "sentiment_decline",
    severity: "high",
    description: "Potential sentiment degradation pattern identified",
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    confidence: 0.92,
    impact: "Projected 15% decrease in user satisfaction",
    recommendation:
      "Review recent personality changes and conversation quality",
  },
  {
    id: "anom_3",
    type: "response_optimization",
    severity: "low",
    description: "Response time improvement opportunity detected",
    predictedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    confidence: 0.78,
    impact: "Potential 25% faster response times possible",
    recommendation: "Optimize knowledge base indexing",
  },
];

const severityConfig = {
  low: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  medium: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  high: { color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
};

/**
 * TrendAnalyzer - Análisis predictivo avanzado con ML insights
 */
export const TrendAnalyzer: React.FC<TrendAnalyzerProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("conversations");
  const [timeRange, setTimeRange] = useState("30_days");
  const [analysisType, setAnalysisType] = useState("predictive");
  const { toast } = useToast();

  const calculateVolatility = (data: any[]) => {
    const values = data.map((d) => d.predicted);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance) / mean;
  };

  // Análisis predictivo calculado
  const analysis = useMemo(() => {
    const data = mockTrendData[selectedMetric as keyof typeof mockTrendData];
    const recent = data.slice(0, 7);
    const future = data.slice(7, 14);

    const avgRecent =
      recent.reduce((sum, d) => sum + d.predicted, 0) / recent.length;
    const avgFuture =
      future.reduce((sum, d) => sum + d.predicted, 0) / future.length;
    const trendPercentage = ((avgFuture - avgRecent) / avgRecent) * 100;

    return {
      currentAvg: avgRecent,
      futureAvg: avgFuture,
      trendPercentage,
      isPositive: trendPercentage > 0,
      confidence: data.reduce((sum, d) => sum + d.confidence, 0) / data.length,
      volatility: calculateVolatility(data.slice(0, 7)),
    };
  }, [selectedMetric]);

  const handleRunAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      if (onAction) {
        await onAction("run-predictive-analysis", {
          metric: selectedMetric,
          timeRange,
          analysisType,
          agentId: agent.agentId || agent.id,
        });
      }

      toast({
        title: "Análisis completado",
        description: `Predicciones generadas para ${selectedMetric} con ${Math.round(
          analysis.confidence * 100
        )}% de confianza`,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error running analysis:", error);
      toast({
        title: "Error en análisis",
        description: "No se pudo completar el análisis predictivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedMetric,
    timeRange,
    analysisType,
    onAction,
    agent,
    toast,
    analysis.confidence,
  ]);

  return (
    <AdminContainer
      title="Predictive Trend Analysis"
      subtitle="Advanced ML-powered insights and forecasting for agent performance"
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conversations">Conversations</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="satisfaction">Satisfaction</SelectItem>
              <SelectItem value="responseTime">Response Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_days">7 Days</SelectItem>
              <SelectItem value="30_days">30 Days</SelectItem>
              <SelectItem value="90_days">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRunAnalysis}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            <Brain className="w-3 h-3 mr-1" />
            {isLoading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Análisis Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Accuracy
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round(analysis.confidence * 100)}%
            </div>
            <div className="text-xs text-blue-600">Model Confidence</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              {analysis.isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium text-green-700">Trend</span>
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                analysis.isPositive ? "text-green-900" : "text-red-900"
              )}
            >
              {analysis.isPositive ? "+" : ""}
              {analysis.trendPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600">Next 7 Days</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Volatility
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {(analysis.volatility * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">Stability Index</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Anomalies
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {mockAnomalies.length}
            </div>
            <div className="text-xs text-amber-600">Detected</div>
          </div>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger
              value="predictions"
              className="flex items-center gap-2"
            >
              <LineChart className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <div className="space-y-4">
              {/* Gráfico simulado */}
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMetric.charAt(0).toUpperCase() +
                      selectedMetric.slice(1)}{" "}
                    Forecast
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Predicted</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                    <span>Actual</span>
                  </div>
                </div>

                {/* Placeholder para gráfico real */}
                <div className="h-64 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Predictive Chart Visualization
                    </p>
                    <p className="text-sm text-gray-500">
                      Integration with Chart.js or D3 pending
                    </p>
                  </div>
                </div>
              </div>

              {/* Predicciones específicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Next 24 Hours
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {analysis.currentAvg.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Confidence: {Math.round(analysis.confidence * 100)}%
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Next 7 Days
                  </h4>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {analysis.futureAvg.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Trend: {analysis.isPositive ? "↗" : "↘"}{" "}
                    {Math.abs(analysis.trendPercentage).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="space-y-3">
              {mockAnomalies.map((anomaly) => {
                const severity =
                  anomaly.severity as keyof typeof severityConfig;
                const SeverityIcon = severityConfig[severity].icon;
                return (
                  <div
                    key={anomaly.id}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center border",
                            severityConfig[severity].color
                          )}
                        >
                          <SeverityIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {anomaly.description}
                            </h4>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium border",
                                severityConfig[severity].color
                              )}
                            >
                              {anomaly.severity.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {anomaly.predictedDate.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {Math.round(anomaly.confidence * 100)}%
                                confidence
                              </span>
                            </div>

                            <p>
                              <strong>Impact:</strong> {anomaly.impact}
                            </p>
                            <p>
                              <strong>Recommendation:</strong>{" "}
                              {anomaly.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      Performance Insights
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Conversaciones pico los martes y jueves</li>
                    <li>• Mayor engagement entre 2-4 PM</li>
                    <li>• Respuestas técnicas tienen mejor rating</li>
                    <li>• Usuarios prefieren respuestas concisas</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      Optimization Opportunities
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Reducir tiempo de respuesta en 15%</li>
                    <li>• Mejorar respuestas de ayuda técnica</li>
                    <li>• Optimizar horarios de mayor actividad</li>
                    <li>• Expandir conocimiento en tendencias</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  AI Recommendations
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Increase Response Frequency
                      </p>
                      <p className="text-sm text-blue-700">
                        Model suggests 23% improvement in engagement with more
                        frequent responses during peak hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900">
                        Personality Adjustment
                      </p>
                      <p className="text-sm text-purple-700">
                        Slightly more casual tone could improve user
                        satisfaction by 12% based on recent interactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">
                        Content Optimization
                      </p>
                      <p className="text-sm text-green-700">
                        Adding more examples and code snippets increases
                        helpfulness ratings by 18%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminContainer>
  );
};
