"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Database, Network } from "lucide-react"

export function MASExtensionPoint() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-500" />
          Multi-Agent System Integration
        </CardTitle>
        <CardDescription>Extension point for future MAS integration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This module is prepared for future integration with a Multi-Agent System. The architecture supports:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
            <li>Agent configuration and management</li>
            <li>Task delegation and coordination</li>
            <li>Reasoning and decision-making capabilities</li>
            <li>Integration with existing ERP modules</li>
          </ul>
          <div className="pt-2">
            <Button variant="outline" className="w-full" disabled>
              Configure MAS (Coming Soon)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KGRAGExtensionPoint() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Network className="h-5 w-5 mr-2 text-cyan-500" />
          Knowledge Graph RAG Integration
        </CardTitle>
        <CardDescription>Extension point for future KG-RAG integration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This module is prepared for future integration with Knowledge Graph-enhanced Retrieval-Augmented Generation.
            The architecture supports:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
            <li>Entity and relationship modeling</li>
            <li>Knowledge extraction from ERP data</li>
            <li>Graph-based retrieval for enhanced context</li>
            <li>Integration with generative AI capabilities</li>
          </ul>
          <div className="pt-2">
            <Button variant="outline" className="w-full" disabled>
              Configure KG-RAG (Coming Soon)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DatabaseExtensionPoint() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-emerald-500" />
          Database Integration
        </CardTitle>
        <CardDescription>Connected to Neon PostgreSQL</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            The ERP system is connected to a Neon PostgreSQL database with the following features:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
            <li>Relational data model with 25+ tables</li>
            <li>Referential integrity between modules</li>
            <li>Transaction support for data consistency</li>
            <li>Prepared for future scaling and extensions</li>
          </ul>
          <div className="pt-2">
            <Button variant="outline" className="w-full">
              View Database Schema
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
