'use client'
import React, { useState, useEffect } from 'react';
import { PieChart, Pie , ResponsiveContainer , XAxis , YAxis , CartesianGrid , Legend , Tooltip} from "recharts";

const PieChartComponent = ()=>{
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        console.log(result)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
     <ResponsiveContainer height="100%" width="100%">
        <PieChart width={500} height={400} data={data}>
            <XAxis/>
            <YAxis/>
            <Legend/>
            <Tooltip/>
            <CartesianGrid strokeDasharray='5 5'/>
            <Pie type="monotone" dataKey="price" fill='#308206' stroke='#246300'/>
           <Pie type="monotone" dataKey="rating.count" fill='#740A03' stroke='#740A03'/>
           
        </PieChart>
     </ResponsiveContainer>
  )
}

export default PieChartComponent