import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Modal, Button, Form } from 'react-bootstrap';

Chart.register(...registerables);

const fetchBrentData = async () => {
  const response = await fetch('http://127.0.0.1:5000/api/brent-oil-data');
  return response.json();
};

const fetchChangePoints = async () => {
  const response = await fetch('http://127.0.0.1:5000/api/change-points');
  return response.json();
};

const fetchEvents = async () => {
  const response = await fetch('http://127.0.0.1:5000/api/events');
  return response.json();
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [changePoints, setChangePoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCP, setSelectedCP] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [eventType, setEventType] = useState('All');

  useEffect(() => {
    // Fetch all data on mount
    fetchBrentData().then((d) => {
      setData(d.prices);
      setLabels(d.dates);
      setDateRange([d.dates[0], d.dates[d.dates.length - 1]]);
    });
    fetchChangePoints().then(setChangePoints);
    fetchEvents().then(setEvents);
  }, []);

  // Filter events by type and date range
  const filteredEvents = events.filter((e) => {
    const inRange = (!dateRange[0] || e.date >= dateRange[0]) && (!dateRange[1] || e.date <= dateRange[1]);
    const typeMatch = eventType === 'All' || e.type === eventType;
    return inRange && typeMatch;
  });

  // Chart.js datasets
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Brent Oil Price',
        data,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        pointRadius: 0,
        fill: true,
      },
      // Overlay change points as vertical lines
      ...changePoints.map((cp, i) => ({
        label: `Change Point ${i + 1}`,
        data: data.map((_, idx) => (idx === cp.index ? data[idx] : null)),
        borderColor: 'red',
        borderWidth: 2,
        pointRadius: 6,
        pointBackgroundColor: 'red',
        type: 'line',
        showLine: false,
        datalabels: {
          display: false,
        },
      })),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label.startsWith('Change Point')) {
              const cpIdx = parseInt(context.dataset.label.split(' ')[2]) - 1;
              const cp = changePoints[cpIdx];
              const event = events.find(e => e.date === labels[cp.index]);
              return event ? `Change Point: ${labels[cp.index]}\nEvent: ${event.description}` : `Change Point: ${labels[cp.index]}`;
            }
            return `Price: $${context.parsed.y}`;
          }
        }
      }
    },
    onClick: (e, elements, chart) => {
      if (elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        if (chartData.datasets[datasetIndex].label.startsWith('Change Point')) {
          setSelectedCP(changePoints[datasetIndex - 1]);
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Price (USD per barrel)' } },
    },
  };

  // Event type options
  const eventTypes = ['All', ...Array.from(new Set(events.map(e => e.type)))];

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Form.Label>Date Range:</Form.Label>
        <Form.Control type="date" value={dateRange[0] || ''} onChange={e => setDateRange([e.target.value, dateRange[1]])} />
        <Form.Control type="date" value={dateRange[1] || ''} onChange={e => setDateRange([dateRange[0], e.target.value])} />
        <Form.Label>Event Type:</Form.Label>
        <Form.Select value={eventType} onChange={e => setEventType(e.target.value)}>
          {eventTypes.map(type => <option key={type}>{type}</option>)}
        </Form.Select>
      </div>
      <Line data={chartData} options={options} height={350} />
      {/* Annotate events */}
      <ul style={{ marginTop: '1rem' }}>
        {filteredEvents.map((e, i) => (
          <li key={i}><b>{e.date}</b>: {e.description} ({e.type})</li>
        ))}
      </ul>
      {/* Modal for change point details */}
      <Modal show={!!selectedCP} onHide={() => setSelectedCP(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Point Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCP && (
            <div>
              <p><b>Date:</b> {labels[selectedCP.index]}</p>
              <p><b>Quantitative Impact:</b> {selectedCP.impact}</p>
              <p><b>Associated Event:</b> {(() => {
                const event = events.find(e => e.date === labels[selectedCP.index]);
                return event ? `${event.description} (${event.type})` : 'None';
              })()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCP(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
