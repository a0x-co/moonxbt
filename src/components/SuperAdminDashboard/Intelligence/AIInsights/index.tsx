"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AdminContainer } from "../../Shared/AdminContainer";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  Zap,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  Star,
  Rocket,
  Shield,
  Cpu,
  Database,
  Network,
  Globe,
  Smartphone,
  Bot,
  Heart,
  ThumbsUp,
  Award,
  Compass,
  Filter
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";
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
  TabsTrigger 
} from "@/components/shadcn/tabs";
import { Progress } from "@/components/shadcn/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shadcn/use-toast";

interface AIInsightsProps {
  agent: any;
  onAction?: (action: string, params: any) => void;
}

// Sistema de insights AI avanzado
const generateAIInsights = () => {
  const insights = [
    {
      id: "insight_1",
      type: "performance_optimization",
      priority: "high",
      confidence: 0.94,
      title: "Response Time Optimization Opportunity",
      description: "ML analysis indicates 32% improvement possible by optimizing knowledge retrieval patterns",
      impact: "Medium-High",
      effort: "Low",
      roi: "185%",
      recommendation: "Implement vector database indexing optimization",
      dataPoints: ["avg_response_time", "knowledge_retrieval_latency", "user_satisfaction"],
      category: "Performance",
      actionable: true,
      estimatedGain: "+32% faster responses",
      timeline: "2-3 days implementation"
    },
    {
      id: "insight_2", 
      type: "conversation_quality",
      priority: "high",
      confidence: 0.89,
      title: "Personality Alignment Enhancement",
      description: "Advanced NLP analysis shows specific communication patterns increase user satisfaction by 28%",
      impact: "High",
      effort: "Medium",
      roi: "240%",
      recommendation: "Adjust conversational tone for technical queries to be more detailed and solution-focused",
      dataPoints: ["sentiment_analysis", "conversation_ratings", "user_retention"],
      category: "Quality",
      actionable: true,
      estimatedGain: "+28% satisfaction score",
      timeline: "1 week tuning"
    },
    {
      id: "insight_3",
      type: "user_engagement",
      priority: "medium",
      confidence: 0.87,
      title: "Peak Engagement Window Identified",
      description: "Temporal analysis reveals optimal posting times that increase engagement by 45%",
      impact: "Medium",
      effort: "Low", 
      roi: "156%",
      recommendation: "Schedule more content between 2-4 PM and 7-9 PM local time",
      dataPoints: ["engagement_metrics", "posting_times", "user_activity_patterns"],
      category: "Engagement",
      actionable: true,
      estimatedGain: "+45% engagement rate",
      timeline: "Immediate"
    },
    {
      id: "insight_4",
      type: "knowledge_gaps",
      priority: "medium",
      confidence: 0.82,
      title: "Knowledge Base Enhancement Required",
      description: "Conversation analysis identifies 15 high-frequency topics with insufficient knowledge coverage",
      impact: "Medium",
      effort: "High",
      roi: "120%",
      recommendation: "Expand knowledge base in blockchain technology, DeFi protocols, and smart contract development",
      dataPoints: ["conversation_topics", "knowledge_confidence", "user_questions"],
      category: "Knowledge",
      actionable: true,
      estimatedGain: "+23% query resolution",
      timeline: "2-3 weeks content creation"
    },
    {
      id: "insight_5",
      type: "user_behavior",
      priority: "low",
      confidence: 0.79,
      title: "User Journey Pattern Discovery",
      description: "Behavioral analysis reveals distinct user archetypes with different interaction preferences",
      impact: "Low-Medium",
      effort: "Medium",
      roi: "95%",
      recommendation: "Implement personalized response strategies based on user interaction history",
      dataPoints: ["user_interaction_patterns", "conversation_flow", "preference_analysis"],
      category: "Personalization",
      actionable: false,
      estimatedGain: "+15% user retention",
      timeline: "1 month development"
    }
  ];

  return insights;
};

// Métricas de AI Performance
const aiMetrics = {
  modelAccuracy: 94.7,
  predictionConfidence: 87.3,
  insightsGenerated: 247,
  recommendationsImplemented: 156,
  averageROI: 178,
  processingTime: 1.2,
  dataQualityScore: 92.1,
  lastTraining: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
};

// Configuración de prioridades
const priorityConfig = {
  high: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  low: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle }
};

// Configuración de categorías
const categoryConfig = {
  Performance: { color: "bg-blue-100 text-blue-800", icon: Zap },
  Quality: { color: "bg-purple-100 text-purple-800", icon: Star },
  Engagement: { color: "bg-green-100 text-green-800", icon: Users },
  Knowledge: { color: "bg-orange-100 text-orange-800", icon: Brain },
  Personalization: { color: "bg-pink-100 text-pink-800", icon: Heart }
};

/**
 * AIInsights - Sistema avanzado de insights powered by AI
 */
export const AIInsights: React.FC<AIInsightsProps> = ({
  agent,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(generateAIInsights());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Filtrar insights
  const filteredInsights = useMemo(() => {
    let filtered = insights;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(insight => insight.category === selectedCategory);
    }
    
    if (selectedPriority !== "all") {
      filtered = filtered.filter(insight => insight.priority === selectedPriority);
    }
    
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority as keyof typeof priorityOrder] - 
               priorityOrder[a.priority as keyof typeof priorityOrder];
      }
      return b.confidence - a.confidence;
    });
  }, [insights, selectedCategory, selectedPriority]);

  // Analytics de insights
  const insightAnalytics = useMemo(() => {
    const total = insights.length;
    const actionable = insights.filter(i => i.actionable).length;
    const highPriority = insights.filter(i => i.priority === 'high').length;
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / total;
    const avgROI = insights.reduce((sum, i) => sum + parseFloat(i.roi.replace('%', '')), 0) / total;
    
    return {
      total,
      actionable,
      highPriority,
      avgConfidence: Math.round(avgConfidence * 100),
      avgROI: Math.round(avgROI)
    };
  }, [insights]);

  const handleGenerateInsights = useCallback(async () => {
    setIsGenerating(true);
    try {
      if (onAction) {
        await onAction('generate-ai-insights', {
          agentId: agent.agentId || agent.id,
          analysisDepth: 'comprehensive',
          includePersonalization: true,
          includeROIAnalysis: true
        });
      }
      
      // Simular nueva generación de insights
      await new Promise(resolve => setTimeout(resolve, 3000));
      setInsights(generateAIInsights());
      
      toast({
        title: "New insights generated",
        description: `Generated ${insights.length} AI-powered recommendations with avg ${insightAnalytics.avgConfidence}% confidence`,
      });
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate new insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [onAction, agent, insights.length, insightAnalytics.avgConfidence, toast]);

  const handleImplementInsight = useCallback(async (insightId: string) => {
    try {
      const insight = insights.find(i => i.id === insightId);
      if (!insight) return;
      
      if (onAction) {
        await onAction('implement-ai-recommendation', {
          insightId,
          agentId: agent.agentId || agent.id,
          recommendation: insight.recommendation,
          category: insight.category
        });
      }
      
      toast({
        title: "Implementation started",
        description: `Started implementing: ${insight.title}`,
      });
      
    } catch (error) {
      console.error('Error implementing insight:', error);
    }
  }, [insights, onAction, agent, toast]);

  return (
    <AdminContainer
      title="AI-Powered Insights & Recommendations"
      subtitle={`${insightAnalytics.total} insights analyzed • ${insightAnalytics.actionable} actionable • ${insightAnalytics.avgConfidence}% avg confidence`}
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryConfig).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleGenerateInsights}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105 transition-all duration-200"
            disabled={isGenerating}
          >
            <Brain className={cn("w-3 h-3 mr-1", isGenerating && "animate-pulse")} />
            {isGenerating ? 'Generating...' : 'Generate New'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Model Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{aiMetrics.modelAccuracy}%</div>
            <div className="text-xs text-blue-600">AI Performance</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Insights Quality</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{insightAnalytics.avgConfidence}%</div>
            <div className="text-xs text-purple-600">Avg Confidence</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Average ROI</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{insightAnalytics.avgROI}%</div>
            <div className="text-xs text-green-600">Return on Investment</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <Rocket className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Actionable</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">{insightAnalytics.actionable}</div>
            <div className="text-xs text-amber-600">Ready to Implement</div>
          </div>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Smart Insights
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Trend Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Action Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <div className="space-y-4">
              {filteredInsights.map((insight) => {
                const priorityInfo = priorityConfig[insight.priority as keyof typeof priorityConfig];
                const categoryInfo = categoryConfig[insight.category as keyof typeof categoryConfig];
                const PriorityIcon = priorityInfo.icon;
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={insight.id}
                    className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <CategoryIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {insight.title}
                            </h3>
                            <Badge className={cn("text-xs", priorityInfo.color)}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {insight.priority.toUpperCase()}
                            </Badge>
                            <Badge className={cn("text-xs", categoryInfo.color)}>
                              {insight.category}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {insight.description}
                          </p>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">AI Recommendation</span>
                            </div>
                            <p className="text-sm text-blue-800">{insight.recommendation}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-gray-900">{Math.round(insight.confidence * 100)}%</div>
                              <div className="text-xs text-gray-600">Confidence</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-900">{insight.roi}</div>
                              <div className="text-xs text-green-600">Expected ROI</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-900">{insight.impact}</div>
                              <div className="text-xs text-purple-600">Impact Level</div>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                              <div className="text-lg font-bold text-amber-900">{insight.effort}</div>
                              <div className="text-xs text-amber-600">Effort Required</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {insight.estimatedGain}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {insight.timeline}
                              </span>
                            </div>
                            
                            {insight.actionable && (
                              <Button
                                onClick={() => handleImplementInsight(insight.id)}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 transition-all duration-200"
                              >
                                <Rocket className="w-3 h-3 mr-1" />
                                Implement
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Confidence indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>AI Confidence Level</span>
                        <span>{Math.round(insight.confidence * 100)}%</span>
                      </div>
                      <Progress value={insight.confidence * 100} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  {[
                    { metric: "Response Quality", trend: "+15%", period: "Last 30 days", color: "text-green-600" },
                    { metric: "User Satisfaction", trend: "+23%", period: "Last 30 days", color: "text-green-600" },
                    { metric: "Engagement Rate", trend: "+8%", period: "Last 7 days", color: "text-green-600" },
                    { metric: "Error Rate", trend: "-12%", period: "Last 30 days", color: "text-green-600" }
                  ].map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{trend.metric}</div>
                        <div className="text-xs text-gray-600">{trend.period}</div>
                      </div>
                      <div className={cn("font-bold", trend.color)}>
                        {trend.trend}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prediction Accuracy</span>
                    <span className="font-bold text-blue-600">{aiMetrics.modelAccuracy}%</span>
                  </div>
                  <Progress value={aiMetrics.modelAccuracy} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Data Quality Score</span>
                    <span className="font-bold text-purple-600">{aiMetrics.dataQualityScore}%</span>
                  </div>
                  <Progress value={aiMetrics.dataQualityScore} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Processing Speed</span>
                    <span className="font-bold text-green-600">{aiMetrics.processingTime}s avg</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Last Model Training:</strong> {aiMetrics.lastTraining.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Next training scheduled in 5 days
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Action Plan</h3>
                    <p className="text-sm text-gray-600">Prioritized recommendations for maximum impact</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {filteredInsights
                    .filter(i => i.actionable)
                    .slice(0, 5)
                    .map((insight, index) => (
                    <div key={insight.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{insight.title}</div>
                        <div className="text-sm text-gray-600">{insight.estimatedGain} • {insight.timeline}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{insight.roi} ROI</div>
                        <div className="text-xs text-gray-500">{insight.effort} effort</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {insightAnalytics.avgROI}%
                  </div>
                  <div className="text-sm text-gray-600">Average Expected ROI</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {insightAnalytics.actionable}
                  </div>
                  <div className="text-sm text-gray-600">Ready to Implement</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {Math.round(aiMetrics.processingTime * 10)}h
                  </div>
                  <div className="text-sm text-gray-600">Est. Implementation Time</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminContainer>
  );
};