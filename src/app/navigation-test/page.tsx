"use client";

import { useCategories } from "@/hooks/useCategories";
import { useState } from "react";

export default function NavigationTest() {
  const { groupedCategories, loading } = useCategories();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  if (loading) {
    return <div className="p-8">Loading categories...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Dropdown Test</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Category Groups Summary:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(groupedCategories).map(group => (
            <div key={group} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-600">{group}</h3>
              <p className="text-sm text-gray-600">
                {groupedCategories[group].length} categories
              </p>
              <p className="text-xs text-gray-500">
                {groupedCategories[group].length > 1 ? '✅ Has Dropdown' : '❌ Direct Link'}
              </p>
              
              {groupedCategories[group].length > 1 && (
                <div className="mt-2 text-xs">
                  <strong>Categories:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {groupedCategories[group].map(cat => (
                      <li key={cat._id}>{cat.name} ({cat.type})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Dropdown Test Area:</h2>
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          {Object.keys(groupedCategories).map(group => (
            <div
              key={group}
              className="relative"
              onMouseEnter={() => setHoveredGroup(group)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                {group}
                {groupedCategories[group].length > 1 && ' ▼'}
              </button>
              
              {hoveredGroup === group && groupedCategories[group].length > 1 && (
                <div className="absolute top-full left-0 mt-2 min-w-[300px] bg-white shadow-lg rounded-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">{group}</h4>
                    
                    {/* Group by type */}
                    {(() => {
                      const byType = groupedCategories[group].reduce((acc: any, cat) => {
                        if (!acc[cat.type]) acc[cat.type] = [];
                        acc[cat.type].push(cat);
                        return acc;
                      }, {});
                      
                      return Object.entries(byType).map(([type, cats]: [string, any]) => (
                        <div key={type} className="mb-3 last:mb-0">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {type === 'Category' ? 'By Type' : 
                             type === 'Occasion' ? 'By Occasion' :
                             type === 'Character' ? 'Character Cakes' : type}
                          </h5>
                          <div className="space-y-1">
                            {cats.map((cat: any) => (
                              <div key={cat._id} className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer px-2 py-1 rounded hover:bg-blue-50">
                                {cat.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Raw Data:</h2>
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(groupedCategories, null, 2)}
        </pre>
      </div>
    </div>
  );
}
