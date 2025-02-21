import React, { useState } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { addLeaveRequest, updateLeaveRequest } from "../redux/store";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import fr from "date-fns/locale/fr";
import { navigate } from "react-big-calendar/lib/utils/constants";
import { useNavigate } from "react-router-dom";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "fr": fr },
});

const App = () => {
  const dispatch = useDispatch();
  const leaveRequests = useSelector((state) => state.leave.leaveRequests);
  const manager = useSelector((state) => state.leave.currentManager);

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: null,
    start: new Date(),
    end: new Date(),
    status: "En attente",
    employee_id: manager.employees[0]?.id,
  });

  // Filter leave requests for the employees of the current manager
  const filteredLeaveRequests = leaveRequests
    .filter((req) => req.manager_id === manager.id)
    .map((req) => ({
      ...req,
      start: new Date(req.start),
      end: new Date(req.end),
      name: manager.employees.find((emp) => emp.id === req.employee_id).name,
    }));

  const getEventStyle = (event) => {
    let bgColor = "#ffc107"; // En attente (Yellow)
    if (event.status === "Approuvé") bgColor = "#28a745"; // Approuvé (Green)
    if (event.status === "Refusé") bgColor = "#dc3545"; // Refusé (Red)
    if (event.status === "Reporté") bgColor = "#b04c33"; // Reporté (Yellow)
    return { style: { backgroundColor: bgColor } };
  };

  const handleDateClick = ({ start, end }) => {
    console.log("Date clicked:", start); // log to see the clicked date
    const existingEvent = leaveRequests.find(
      (req) => req.start === start.toISOString() && req.employee_id === newEvent.employee_id
    );
    if (existingEvent) {
      // Set to edit the existing event
      setNewEvent(existingEvent);
    } else {
      // Set to create a new event
      setNewEvent({
        ...newEvent,
        start,
        end,
        id: null, // New event, so no id initially
      });
    }
    setShowModal(true); // Show the modal
  };

  const handleSelectEvent = (event) => {
    console.log("Event clicked:", event); // log the clicked event
    setNewEvent(event); // Populate the form with the event's details
    setShowModal(true); // Show the modal for editing
  };

  const handleSaveEvent = () => {
    if (newEvent.id) {
      // Update the existing leave request
      dispatch(updateLeaveRequest({
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString(),
      }));
    } else {
      // Add a new leave request
      dispatch(addLeaveRequest({
        ...newEvent,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString(),
        manager_id: manager.id,
      }));
    }
    setShowModal(false); // Close the modal after saving
    resetForm(); // Reset the form to avoid carrying over previous data
  };

  const resetForm = () => {
    setNewEvent({
      id: null,
      start: new Date(),
      end: new Date(),
      status: "En attente",
      employee_id: manager.employees[0]?.id,
    });
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/'); // Déconnecte l'utilisateur
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestion des Congés</h2>
        <Button variant="danger" onClick={handleLogout} className="ms-auto">
          Déconnexion
        </Button>
      </div>
      <Calendar
        localizer={localizer}
        culture="fr"
        views={["month"]}
        events={filteredLeaveRequests}
        titleAccessor="name"
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={getEventStyle}
        selectable
        messages={{
          today: "Aujourd'hui",
          previous: "❮ Mois précédent",
          next: "Mois suivant ❯",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Événement",
          noEventsInRange: "Aucun rendez-vous prévu",
        }}
        onSelectSlot={handleDateClick} // Capture click on a date
        onSelectEvent={handleSelectEvent} // Capture click on an event
      />

      {/* Modal to add or edit an event */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{newEvent.id ? "Modifier un Congé" : "Ajouter un Congé"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'employé</Form.Label>
              <Form.Control
                as="select"
                value={newEvent.employee_id}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, employee_id: e.target.value })
                }
              >
                {manager.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Début</Form.Label>
              <Form.Control
                type="date"
                value={format(newEvent.start, "yyyy-MM-dd")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: new Date(e.target.value) })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fin</Form.Label>
              <Form.Control
                type="date"
                value={format(newEvent.end, "yyyy-MM-dd")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: new Date(e.target.value) })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Control
                as="select"
                value={newEvent.status}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, status: e.target.value })
                }
              >
                <option value="En attente">En attente</option>
                <option value="Approuvé">Approuvé</option>
                <option value="Refusé">Refusé</option>
                <option value="Reporté">Reporté</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSaveEvent}>
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;
