import React, { useRef } from "react";
import { Line, Bar, Scatter, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
  tableData: any[];
  sql: string;
  chartType: string;
}

const Chart: React.FC<ChartProps> = ({ data, tableData, sql, chartType }) => {
  const chartRef = useRef<any>(null);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chat Analytics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sql).catch((err) => {
      console.error("Could not copy text: ", err);
    });
  };

  const handleDownloadChart = () => {
    const link = document.createElement("a");
    link.href = chartRef.current.toBase64Image();
    link.download = "chart.png";
    link.click();
  };

  const handleDownloadTable = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    XLSX.writeFile(workbook, "table_data.xlsx");
  };

  const renderChart = () => {
    if (!data || !data.datasets) {
      return <div>No data available</div>;
    }

    switch (chartType) {
      case "Bar chart":
        return <Bar ref={chartRef} data={data} options={options} />;
      case "Histogram":
        return <Bar ref={chartRef} data={data} options={options} />;
      case "Scatter plot":
        return <Scatter ref={chartRef} data={data} options={options} />;
      case "Line chart":
      default:
        return <Line ref={chartRef} data={data} options={options} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto relative">
      <div className="mb-4">
        <strong>SQL Query:</strong>
        <div className="relative">
          <SyntaxHighlighter
            language="sql"
            style={materialDark}
            className="rounded-md"
          >
            {sql}
          </SyntaxHighlighter>
          <button
            onClick={handleCopyToClipboard}
            className="absolute top-0 right-0 mt-2 mr-2 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="relative">
        {renderChart()}
        <button
          onClick={handleDownloadChart}
          className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Download Chart
        </button>
      </div>
      {tableData.length > 0 && (
        <div className="relative mt-4">
          <button
            onClick={handleDownloadTable}
            className="absolute top-0 right-0 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download Table
          </button>
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr>
                {Object.keys(tableData[0]).map((key) => (
                  <th
                    key={key}
                    className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td
                      key={i}
                      className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700"
                    >
                      {value as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Chart;
