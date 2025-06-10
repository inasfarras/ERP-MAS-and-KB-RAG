"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";

function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your projects.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage project tasks.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timesheets</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage timesheets.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ProjectsPage); 