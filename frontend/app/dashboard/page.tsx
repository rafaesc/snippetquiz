'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target } from "lucide-react";

function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Today's Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Attempts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-semibold">5</span>
                  <span className="text-xs text-muted-foreground">Content Entries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">5</span>
                  <span className="text-xs text-muted-foreground">Question Responses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-turquoise-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;