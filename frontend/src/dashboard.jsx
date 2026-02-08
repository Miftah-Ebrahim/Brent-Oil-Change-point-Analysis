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
    maintainAspectRatio: false,
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
    <div className="container-fluid p-4">
      <h2 className="mb-4 text-center">Brent Oil Price Analysis Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <Form.Label>Start Date:</Form.Label>
          <Form.Control type="date" value={dateRange[0] || ''} onChange={e => setDateRange([e.target.value, dateRange[1]])} />
        </div>
        <div className="col-md-4">
          <Form.Label>End Date:</Form.Label>
          <Form.Control type="date" value={dateRange[1] || ''} onChange={e => setDateRange([dateRange[0], e.target.value])} />
        </div>
        <div className="col-md-4">
          <Form.Label>Event Type:</Form.Label>
          <Form.Select value={eventType} onChange={e => setEventType(e.target.value)}>
            {eventTypes.map(type => <option key={type}>{type}</option>)}
          </Form.Select>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12" style={{ height: '500px' }}>
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <Line data={chartData} options={options} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Historical Events Timeline</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredEvents.map((e, i) => (
                  <li key={i} className="list-group-item">
                    <span className="badge bg-secondary me-2">{e.date}</span>
                    <strong>{e.description}</strong>
                    <span className="badge bg-info text-dark ms-2">{e.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for change point details */}
      <Modal show={!!selectedCP} onHide={() => setSelectedCP(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Point Detected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCP && (
            <div className="p-3">
              <h4 className="text-center mb-3">{labels[selectedCP.index]}</h4>
              <p><b>Quantitative Impact:</b> {selectedCP.impact}</p>
              <hr />
              <p className="mb-1"><b>Correlated Key Event:</b></p>
              {(() => {
                const event = events.find(e => e.date === labels[selectedCP.index]);
                return event ? (
                  <div className="alert alert-warning">
                    <strong>{event.description}</strong><br/>
                    <small>Type: {event.type}</small>
                  </div>
                ) : <div className="text-muted">No specific event recorded on this exact date.</div>;
              })()}
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
