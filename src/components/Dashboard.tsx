import React, { useState, useCallback, useEffect } from "react";
import ChatBot from "./ChatBot";
import Chart from "./Chart";
import OldDataDisplay from "./OldDataDisplay";

const Dashboard: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(30); // Initial split at 30%
  const [chartData, setChartData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [oldData, setOldData] = useState<
    { data: any; tableData: any[]; sql: string }[]
  >([]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const container = document.getElementById("dashboard-container");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newPosition =
            ((e.clientX - containerRect.left) / containerRect.width) * 100;
          setSplitPosition(Math.min(Math.max(newPosition, 20), 80));
        }
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const addOldData = (data: any, tableData: any[], sql: string) => {
    setOldData((prevData) => [...prevData, { data, tableData, sql }]);
  };

  return (
    <div
      id="dashboard-container"
      className="flex h-screen bg-gray-100 relative select-none"
    >
      {/* Left panel - ChatBot */}
      <div className="h-full" style={{ width: `${splitPosition}%` }}>
        <ChatBot
          setChartData={(data, sql) => {
            setChartData(data);
            setSqlQuery(sql);
          }}
          setTableData={setTableData}
          addOldData={addOldData}
        />
      </div>

      {/* Draggable Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className="w-2 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors duration-200"
        style={{
          backgroundColor: isDragging ? "#60A5FA" : "#E5E7EB",
        }}
      />

      {/* Right panel - Chart */}
      <div
        className="h-full overflow-y-auto"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {oldData.map((data, index) => (
          <OldDataDisplay
            key={index}
            data={data.data}
            tableData={data.tableData}
            sql={data.sql}
          />
        ))}
        {chartData ? (
          <Chart data={chartData} tableData={tableData} sql={sqlQuery} />
        ) : (
          <div>No data available</div>
        )}
      </div>

      {/* Overlay when dragging */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 cursor-col-resize"
          style={{ userSelect: "none" }}
        />
      )}
    </div>
  );
};

export default Dashboard;
