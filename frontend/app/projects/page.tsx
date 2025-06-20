"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Container from '@/components/Container';
import withAuth from "@/components/withAuth";

interface Project {
  id: number;
  name: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
}

interface ProjectMetric {
  name: string;
  value: string;
}

interface ProjectsData {
  metrics: ProjectMetric[];
  projects: Project[];
}

function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<ProjectsData>({
    metrics: [],
    projects: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectsData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await new Promise<ProjectsData>((resolve, reject) => {
          setTimeout(() => {
            if (false) { // Always simulate error
              resolve({
                metrics: [
                  { name: 'Total Projects', value: '50' },
                  { name: 'Active Projects', value: '35' },
                  { name: 'Completed Projects', value: '15' },
                ],
                projects: [
                  {
                    id: 1,
                    name: 'Website Redesign',
                    status: 'Active',
                    startDate: '2024-01-01',
                    endDate: '2024-06-30',
                  },
                  {
                    id: 2,
                    name: 'Mobile App Development',
                    status: 'On Hold',
                    startDate: '2024-02-15',
                    endDate: '2024-12-31',
                  },
                  {
                    id: 3,
                    name: 'ERP Integration',
                    status: 'Completed',
                    startDate: '2023-09-01',
                    endDate: '2024-03-31',
                  },
                ],
              });
            } else {
              reject(new Error("Failed to load projects data. Please check your network."));
            }
          }, 1000);
        });
        setProjectsData(response);
      } catch (err: any) {
        console.error("Error fetching projects data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjectsData();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton for Project metrics */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              {/* Skeleton for Projects table/list */}
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <Card className="border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Error Loading Projects Data
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              There was an issue fetching your projects data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Details: {error}</p>
            <p className="mt-2">Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>View key project metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {projectsData.metrics.map((metric) => (
                <div key={metric.name} className="flex justify-between items-center p-2 border rounded-md">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-gray-600">{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Manage your projects and tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectsData.projects.length > 0 ? (
                    projectsData.projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'Active' ? 'bg-green-100 text-green-800' :
                            project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.endDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default withAuth(ProjectsPage); 