'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Projects() {
  const { data: projectData } = useQuery({
    queryKey: ['project-data'],
    queryFn: async () => {
      const response = await axios.get('/api/projects/summary')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
      
      {/* Project Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{projectData?.activeProjects || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Completed Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{projectData?.completedProjects || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${projectData?.totalBudget || 0}</dd>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{projectData?.teamMembers || 0}</dd>
          </div>
        </Card>
      </div>

      {/* Project List */}
      <Card>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Active Projects</h3>
          <div className="mt-4">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Project</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Progress</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projectData?.projects?.map((project: any) => (
                        <tr key={project.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">{project.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.client}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.startDate}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              project.status === 'on-track' ? 'bg-green-50 text-green-700' :
                              project.status === 'at-risk' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 