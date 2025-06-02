"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Import server actions
import { getAgentDashboardData } from "@/server/actions/agent-dashboard-actions";
import { getPercepteurDashboardData } from "@/server/actions/percepteur-dashboard-action";
import { getAdminDashboardData } from "@/server/actions/admin-dashboard-actions";
import {
  getConseilDashboardData,
  getPendingOppositions,
  approveOpposition,
  rejectOpposition,
} from "@/server/actions/membre-dashboard-actions";
import { User } from "@/types/users-schema";

// Mock current user - replace with actual user data from your auth system
const currentUser = {
  id: "1",
  name: "Jean Dupont",
  email: "jean.dupont@mairie.fr",
  role: "membre de conseil", // Change this to test different roles: "agent", "percepteur", "admin", "membre du conseil"
};

export default function Dashboard({ currentUser }: { currentUser: User }) {
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOppositions, setPendingOppositions] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      switch (currentUser.role) {
        case "agent":
          data = await getAgentDashboardData();
          break;
        case "percepteur":
          data = await getPercepteurDashboardData();
          break;
        case "admin":
          data = await getAdminDashboardData();
          break;
        case "membre du conseil":
          data = await getConseilDashboardData();
          const oppositions = await getPendingOppositions(5);
          setPendingOppositions(oppositions);
          break;
        default:
          data = await getAgentDashboardData();
      }

      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Impossible de charger les données du tableau de bord");
      toast.error("Impossible de charger les données du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOpposition = async (oppositionId: number) => {
    try {
      await approveOpposition(
        oppositionId,
        "Approuvé via le tableau de bord",
        currentUser.id
      );
      toast.success("Opposition approuvée avec succès");

      loadDashboardData(); // Reload data
    } catch (error) {
      toast.error("error");
    }
  };

  const handleRejectOpposition = async (oppositionId: number) => {
    try {
      await rejectOpposition(
        oppositionId,
        "Rejeté via le tableau de bord",
        currentUser.id
      );
      toast.success("success");

      loadDashboardData(); // Reload data
    } catch (error) {
      toast.error("error");
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-chart-2 mr-1" />
            <span className="text-xs text-chart-2">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-[400px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[80px] mb-2" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Tableau de Bord Municipal
              </h1>
              <p className="text-muted-foreground">Une erreur s'est produite</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadDashboardData} variant="default">
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const AgentDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Articles"
          value={dashboardData?.articles?.total?.toLocaleString() || "0"}
          description="Propriétés enregistrées"
          icon={Building2}
          trend="+23 ce mois"
        />
        <StatCard
          title="Articles Bâtis"
          value={dashboardData?.articles?.bati || 0}
          description={`${dashboardData?.articles?.total > 0 ? ((dashboardData.articles.bati / dashboardData.articles.total) * 100).toFixed(1) : 0}% du total`}
          icon={Building2}
        />
        <StatCard
          title="Non Bâtis"
          value={dashboardData?.articles?.nonBati || 0}
          description={`${dashboardData?.articles?.total > 0 ? ((dashboardData.articles.nonBati / dashboardData.articles.total) * 100).toFixed(1) : 0}% du total`}
          icon={MapPin}
        />
        <StatCard
          title="En Opposition"
          value={dashboardData?.articles?.byStatus?.opposition_pending || 0}
          description="Nécessitent attention"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mounted ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Densité Urbaine</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    haute: { label: "Haute", color: "var(--chart-1)" },
                    moyenne: { label: "Moyenne", color: "var(--chart-2)" },
                    basse: { label: "Basse", color: "var(--chart-3)" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Haute",
                          value: dashboardData?.articles?.byDensity?.haute || 0,
                        },
                        {
                          name: "Moyenne",
                          value:
                            dashboardData?.articles?.byDensity?.moyenne || 0,
                        },
                        {
                          name: "Basse",
                          value: dashboardData?.articles?.byDensity?.basse || 0,
                        },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value">
                        {[
                          { fill: "var(--chart-1)" },
                          { fill: "var(--chart-2)" },
                          { fill: "var(--chart-3)" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut des Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                      <span className="text-sm">Actifs</span>
                    </div>
                    <Badge variant="secondary">
                      {dashboardData?.articles?.byStatus?.active || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-chart-4" />
                      <span className="text-sm">Opposition en cours</span>
                    </div>
                    <Badge variant="outline">
                      {dashboardData?.articles?.byStatus?.opposition_pending ||
                        0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-chart-3" />
                      <span className="text-sm">Opposition refusée</span>
                    </div>
                    <Badge variant="destructive">
                      {dashboardData?.articles?.byStatus?.opposition_refused ||
                        0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        )}
      </div>
    </div>
  );

  const PercepteurDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collecté"
          value={`${((dashboardData?.payments?.totalCollected || 0) / 1000000).toFixed(2)}M €`}
          description="Revenus totaux"
          icon={Euro}
          trend="+12.5% vs année dernière"
        />
        <StatCard
          title="Ce Mois"
          value={`${((dashboardData?.payments?.thisMonth || 0) / 1000).toFixed(0)}k €`}
          description="Paiements reçus"
          icon={CreditCard}
          trend="+8.2% vs mois dernier"
        />
        <StatCard
          title="En Attente"
          value={`${((dashboardData?.payments?.pendingPayments || 0) / 1000).toFixed(0)}k €`}
          description="Paiements dus"
          icon={Clock}
        />
        <StatCard
          title="Taux de Collecte"
          value={`${(dashboardData?.payments?.collectionRate || 0).toFixed(1)}%`}
          description="Efficacité de collecte"
          icon={TrendingUp}
          trend="+2.1% ce trimestre"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mounted ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Évolution Mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: { label: "Montant", color: "var(--chart-1)" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData?.payments?.monthlyTrend || []}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData?.payments?.byMethod || []).map(
                    (method, index) => {
                      const colors = [
                        "var(--chart-1)",
                        "var(--chart-2)",
                        "var(--chart-3)",
                        "var(--chart-4)",
                        "var(--chart-5)",
                      ];
                      return (
                        <div
                          key={method.method}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: colors[index % colors.length],
                              }}
                            />
                            <span className="text-sm">{method.method}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {(method.amount / 1000).toFixed(0)}k €
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {method.count} transactions
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        )}
      </div>
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={dashboardData?.users?.total || 0}
          description="Comptes actifs"
          icon={Users}
          trend="+3 ce mois"
        />
        <StatCard
          title="Agents"
          value={dashboardData?.users?.byRole?.agent || 0}
          description="Agents municipaux"
          icon={Building2}
        />
        <StatCard
          title="Percepteurs"
          value={dashboardData?.users?.byRole?.percepteur || 0}
          description="Gestionnaires paiements"
          icon={CreditCard}
        />
        <StatCard
          title="Conseil"
          value={dashboardData?.users?.byRole?.["membre du conseil"] || 0}
          description="Membres du conseil"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mounted ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Rôles</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    agent: { label: "Agents", color: "var(--chart-1)" },
                    percepteur: {
                      label: "Percepteurs",
                      color: "var(--chart-2)",
                    },
                    admin: { label: "Admins", color: "var(--chart-3)" },
                    conseil: { label: "Conseil", color: "var(--chart-4)" },
                    citizen: { label: "Citoyens", color: "var(--chart-5)" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Agents",
                            value: dashboardData?.users?.byRole?.agent || 0,
                          },
                          {
                            name: "Percepteurs",
                            value:
                              dashboardData?.users?.byRole?.percepteur || 0,
                          },
                          {
                            name: "Admins",
                            value: dashboardData?.users?.byRole?.admin || 0,
                          },
                          {
                            name: "Conseil",
                            value:
                              dashboardData?.users?.byRole?.[
                                "membre du conseil"
                              ] || 0,
                          },
                          {
                            name: "Citoyens",
                            value: dashboardData?.users?.byRole?.citizen || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { fill: "var(--chart-1)" },
                          { fill: "var(--chart-2)" },
                          { fill: "var(--chart-3)" },
                          { fill: "var(--chart-4)" },
                          { fill: "var(--chart-5)" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilisateurs actifs ce mois</span>
                    <Badge variant="secondary">
                      {dashboardData?.users?.activeThisMonth || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nouveaux utilisateurs</span>
                    <Badge variant="outline">
                      {dashboardData?.users?.newThisMonth || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'activité</span>
                    <Badge variant="default">
                      {dashboardData?.users?.total > 0
                        ? (
                            (dashboardData.users.activeThisMonth /
                              dashboardData.users.total) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        )}
      </div>
    </div>
  );

  const ConseilDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Oppositions"
          value={dashboardData?.oppositions?.total || 0}
          description="Depuis le début"
          icon={FileText}
        />
        <StatCard
          title="En Attente"
          value={dashboardData?.oppositions?.pending || 0}
          description="Nécessitent traitement"
          icon={Clock}
          trend={`Urgent: ${dashboardData?.oppositions?.urgent || 0} > 7 jours`}
        />
        <StatCard
          title="Approuvées"
          value={dashboardData?.oppositions?.approved || 0}
          description="Ce mois"
          icon={CheckCircle}
        />
        <StatCard
          title="Temps Moyen"
          value={`${dashboardData?.oppositions?.avgResolutionTime || 0}j`}
          description="Résolution opposition"
          icon={TrendingUp}
          trend="-2j vs mois dernier"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mounted ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Oppositions Récentes</CardTitle>
                <CardDescription>Nécessitent votre attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOppositions.length > 0 ? (
                    pendingOppositions.map((opposition) => (
                      <div
                        key={opposition.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-accent/50"
                      >
                        <div>
                          <div className="font-medium">
                            Article #{opposition.articleId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Soumis il y a {opposition.daysOld} jour
                            {opposition.daysOld > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApproveOpposition(opposition.id)
                            }
                            className="hover:bg-chart-2/20 hover:text-chart-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRejectOpposition(opposition.id)
                            }
                            className="hover:bg-chart-3/20 hover:text-chart-3"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Aucune opposition en attente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques de Traitement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'approbation</span>
                    <Badge variant="secondary">
                      {dashboardData?.oppositions?.approved +
                        dashboardData?.oppositions?.refused >
                      0
                        ? (
                            (dashboardData.oppositions.approved /
                              (dashboardData.oppositions.approved +
                                dashboardData.oppositions.refused)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">En attente &gt; 7 jours</span>
                    <Badge variant="destructive">
                      {dashboardData?.oppositions?.urgent || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Traitées cette semaine</span>
                    <Badge variant="outline">
                      {(dashboardData?.oppositions?.approvedThisMonth || 0) +
                        (dashboardData?.oppositions?.refusedThisMonth || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficacité de traitement</span>
                    <Badge variant="default">87%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        )}
      </div>
    </div>
  );

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      agent: "Agent Municipal",
      percepteur: "Percepteur Municipal",
      admin: "Administrateur",
      "membre du conseil": "Membre du Conseil",
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleIcon = (role: string) => {
    const roleIcons = {
      agent: Building2,
      percepteur: CreditCard,
      admin: Users,
      "membre du conseil": AlertTriangle,
    };
    return roleIcons[role as keyof typeof roleIcons] || Building2;
  };

  const renderDashboard = () => {
    switch (currentUser.role) {
      case "agent":
        return <AgentDashboard />;
      case "percepteur":
        return <PercepteurDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "membre du conseil":
        return <ConseilDashboard />;
      default:
        return <AgentDashboard />;
    }
  };

  const RoleIcon = getRoleIcon(currentUser.role);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <RoleIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Tableau de Bord - {getRoleDisplayName(currentUser.role)}
              </h1>
              <p className="text-muted-foreground">
                Bienvenue, {currentUser.name}
              </p>
            </div>
          </div>
        </div>

        {renderDashboard()}
      </div>
    </div>
  );
}
