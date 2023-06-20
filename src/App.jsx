import { useState, useEffect } from 'react'
import './App.css'
import salesData from '../data/sales.json'
import Plot from 'react-plotly.js';

function App() {
  const [pieData, setPieData] = useState([])
  const [lineData, setLineData] = useState([])
  const [barData, setBarData] = useState([])
  const [bubbleData, setBubbleData] = useState([])
  const [timeHeatData, setTimeHeatData] = useState([])
  const visualizationEdgeLength = 600
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


  useEffect(() => {
    let pieDataRaw = {}
    let lineDataRaw = {}
    let barDataRaw = {}
    let bubbleDataRaw = {}
    let timeHeatDataRaw = {}

    salesData.forEach(elem => {
      // For Pie Chart
      pieDataRaw = {
        ...pieDataRaw,
        [elem.COUNTRY]: (pieDataRaw[elem.COUNTRY] || 0) + elem.SALES
      }
      setPieData(pieDataRaw)

      // For Line Series Chart
      lineDataRaw = {
        ...lineDataRaw,
        [elem.YEAR_ID]: (lineDataRaw[elem.YEAR_ID] || 0) + 1
      }
      setLineData(lineDataRaw)

      // For Bar Chart
      barDataRaw = {
        ...barDataRaw,
        [elem.COUNTRY]: {
          ...(barDataRaw[elem.COUNTRY]),
          [elem.DEALSIZE]: (barDataRaw[elem.COUNTRY] ? barDataRaw[elem.COUNTRY][elem.DEALSIZE] || 0 : 0) + 1
        }
      }
      setBarData(barDataRaw)

      // For Bubble Graph
      bubbleDataRaw = {
        ...bubbleDataRaw,
        [elem.COUNTRY]: {
          ...(bubbleDataRaw[elem.COUNTRY]),
          sales: (bubbleDataRaw[elem.COUNTRY] ? bubbleDataRaw[elem.COUNTRY].sales || 0 : 0) + elem.SALES,
          orderCount: (bubbleDataRaw[elem.COUNTRY] ? bubbleDataRaw[elem.COUNTRY].orderCount || 0 : 0) + 1,
          cumulativeMsrp: (bubbleDataRaw[elem.COUNTRY] ? bubbleDataRaw[elem.COUNTRY].cumulativeMsrp || 0 : 0) + elem.MSRP,
        }
      }
      setBubbleData(bubbleDataRaw)

      // For Time Series Chart & Heatmap
      const saleDate = new Date(elem.YEAR_ID, elem.MONTH_ID)
      const timeHeatDataUnordered = {
        ...timeHeatDataRaw,
        [saleDate.toISOString()]: (timeHeatDataRaw[saleDate.toISOString()] || 0) + elem.SALES
      }
      timeHeatDataRaw = Object.keys(timeHeatDataUnordered).sort().reduce(
        (obj, key) => {
          obj[key] = timeHeatDataUnordered[key];
          return obj;
        },
        {}
      );
      setTimeHeatData(timeHeatDataRaw)

    })

  }, [])


  return (
    <>
      {/* For Pie Chart */}
      <Plot
        data={[
          {
            labels: Object.keys(pieData),
            values: Object.values(pieData),
            textinfo: "label+percent",
            textposition: "outside",
            automargin: true,
            type: 'pie'
          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Country-wise Sales Value Share',
          showlegend: false
        }}
      />

      {/* For Line Series Chart */}
      <Plot
        data={[
          {
            x: Object.keys(lineData),
            y: Object.values(lineData),
            type: 'scatter',
            mode: 'lines+markers'

          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Order Count Over The Years',
          xaxis: {
            tickmode: 'linear'
          }
        }}
      />

      {/* For Bar Chart */}
      <Plot
        data={[
          {
            x: Object.keys(barData),
            y: Object.values(barData).map(elem => elem["Small"]),
            type: 'bar',
            name: 'Small'
          },
          {
            x: Object.keys(barData),
            y: Object.values(barData).map(elem => elem["Medium"]),
            type: 'bar',
            name: 'Medium'
          },
          {
            x: Object.keys(barData),
            y: Object.values(barData).map(elem => elem["Large"]),
            type: 'bar',
            name: 'Large'
          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Deal Size Across Countries',
          barmode: 'group'
        }}
      />

      {/* For Bubble Graph */}
      <Plot
        data={[
          {
            x: Object.values(bubbleData).map(elem => elem.cumulativeMsrp / elem.orderCount),
            y: Object.values(bubbleData).map(elem => elem.sales),
            marker: {
              size: Object.values(bubbleData).map(elem => elem.orderCount / 10)
            },
            text: Object.keys(bubbleData),
            mode: 'markers'

          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Sales vs Avg MSRP across Countries',
        }}
      />

      {/*  For Time Series Chart */}
      <Plot
        data={[
          {
            x: Object.keys(timeHeatData).map(elem => new Date(elem).getUTCFullYear()),
            y: Object.keys(timeHeatData).map(elem => months[new Date(elem).getMonth()]),
            z: Object.values(timeHeatData),
            colorscale: [
              [0, '#880808'],
              [0.3, '#FFEA00'],
              [0.7, '#50C878'],
              [1, '#50C878']
            ],
            type: 'heatmap',

          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Sales Volume Heatmap Data',
          showlegend: false,
          xaxis: {
            tickmode: 'linear'
          }
        }}
      />

      {/* For Heatmap */}
      <Plot
        data={[
          {
            x: Object.keys(timeHeatData),
            y: Object.values(timeHeatData),
            type: 'scatter',

          }
        ]}
        layout={{
          width: visualizationEdgeLength, height: visualizationEdgeLength, title: 'Sales Historic Data',
          showlegend: false
        }}
      />
    </>
  )
}

export default App
