import { useEffect, useState } from "react";
import "./AdvocateDashboard.css";

import {
    getAdvocateAppointments,
    assignSlot,
    rejectAppointment,
} from "../../services/appointmentService";

function AdvocateDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [activeTab, setActiveTab] = useState("dashboard");

    const [appointments, setAppointments] = useState([]);

    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [showSlotModal, setShowSlotModal] = useState(false);

    const [slotForm, setSlotForm] = useState({

        appointmentDate: "",

        appointmentTime: "",

        duration: 30,

        consultationFee: "",

        advocateNotes: "",

    });

    // ================================
    // Fetch Appointment Requests
    // ================================

    const fetchAppointments = async () => {

        try {

            const res = await getAdvocateAppointments(

                user.id || user._id

            );

            setAppointments(res.data.appointments);

        }

        catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchAppointments();

    }, []);

    // ================================
    // Open Slot Modal
    // ================================

    const openSlotModal = (appointment) => {

        setSelectedAppointment(appointment);

        setShowSlotModal(true);

    };

    return (

        <div className="advocate-dashboard">

            {/* ================= Sidebar ================= */}

            <aside className="sidebar">

                <h2>⚖ LegalConnect</h2>

                <button
                    onClick={() => setActiveTab("dashboard")}
                >
                    Dashboard
                </button>

                <button
                    onClick={() => setActiveTab("appointments")}
                >
                    Appointment Requests
                </button>

                <button
                    onClick={() => setActiveTab("profile")}
                >
                    Profile
                </button>

            </aside>

            {/* ================= Main ================= */}

            <main className="main-content">

                {/* Dashboard */}

                {activeTab === "dashboard" && (

                    <div>

                        <h1>

                            Welcome Advocate

                        </h1>

                        <div className="dashboard-cards">

                            <div className="card">

                                <h3>

                                    Pending Requests

                                </h3>

                                <h2>

                                    {

                                        appointments.filter(

                                            a => a.status === "Pending"

                                        ).length

                                    }

                                </h2>

                            </div>

                            <div className="card">

                                <h3>

                                    Approved

                                </h3>

                                <h2>

                                    {

                                        appointments.filter(

                                            a => a.status === "Approved"

                                        ).length

                                    }

                                </h2>

                            </div>

                            <div className="card">

                                <h3>

                                    Completed

                                </h3>

                                <h2>

                                    {

                                        appointments.filter(

                                            a => a.status === "Completed"

                                        ).length

                                    }

                                </h2>

                            </div>

                        </div>

                    </div>

                )}

                {/* ===================================== */}

                {/* Appointment Requests */}

                {/* ===================================== */}

                {activeTab === "appointments" && (

                    <div>

                        <h1>

                            Appointment Requests

                        </h1>

                        {

                            appointments.length === 0 ?

                            (

                                <p>

                                    No Appointment Requests

                                </p>

                            )

                            :

                            (

                                appointments.map((appointment) => (

                                    <div

                                        className="appointment-card"

                                        key={appointment._id}

                                    >

                                        <h3>

                                            {

                                                appointment.client?.fullName

                                            }

                                        </h3>

                                        <p>

                                            <b>

                                                Issue :

                                            </b>

                                            {

                                                appointment.issue

                                            }

                                        </p>

                                        <p>

                                            <b>

                                                Description :

                                            </b>

                                            {

                                                appointment.description

                                            }

                                        </p>

                                        <p>

                                            <b>

                                                Status :

                                            </b>

                                            {

                                                appointment.status

                                            }

                                        </p>

                                        {

                                            appointment.status === "Pending"

                                            &&

                                            <div>

                                                <button

                                                    className="approve-btn"

                                                    onClick={() =>

                                                        openSlotModal(

                                                            appointment

                                                        )

                                                    }

                                                >

                                                    Approve

                                                </button>

                                                <button

                                                    className="reject-btn"

                                                    onClick={async () => {

                                                        await rejectAppointment(

                                                            appointment._id

                                                        );

                                                        fetchAppointments();

                                                    }}

                                                >

                                                    Reject

                                                </button>

                                            </div>

                                        }

                                    </div>

                                ))

                            )

                        }

                    </div>

                )}
                                {/* ===========================
                    Profile
                ============================ */}

                {activeTab === "profile" && (

                    <div className="profile-section">

                        <h1>My Profile</h1>

                        <div className="profile-card">

                            <h2>{user?.fullName}</h2>

                            <p>
                                <strong>Email :</strong> {user?.email}
                            </p>

                            <p>
                                <strong>Phone :</strong> {user?.phone}
                            </p>

                            <p>
                                <strong>Role :</strong> Advocate
                            </p>

                        </div>

                    </div>

                )}

            </main>

            {/* ===========================
                SLOT ASSIGNMENT MODAL
            ============================ */}

            {

                showSlotModal && (

                    <div className="modal-overlay">

                        <div className="slot-modal">

                            <h2>

                                Assign Consultation Slot

                            </h2>

                            <label>

                                Appointment Date

                            </label>

                            <input

                                type="date"

                                value={slotForm.appointmentDate}

                                onChange={(e) =>

                                    setSlotForm({

                                        ...slotForm,

                                        appointmentDate:

                                            e.target.value,

                                    })

                                }

                            />

                            <label>

                                Appointment Time

                            </label>

                            <input

                                type="time"

                                value={slotForm.appointmentTime}

                                onChange={(e) =>

                                    setSlotForm({

                                        ...slotForm,

                                        appointmentTime:

                                            e.target.value,

                                    })

                                }

                            />

                            <label>

                                Duration (Minutes)

                            </label>

                            <input

                                type="number"

                                value={slotForm.duration}

                                onChange={(e) =>

                                    setSlotForm({

                                        ...slotForm,

                                        duration:

                                            e.target.value,

                                    })

                                }

                            />

                            <label>

                                Consultation Fee

                            </label>

                            <input

                                type="number"

                                value={slotForm.consultationFee}

                                onChange={(e) =>

                                    setSlotForm({

                                        ...slotForm,

                                        consultationFee:

                                            e.target.value,

                                    })

                                }

                            />

                            <label>

                                Advocate Notes

                            </label>

                            <textarea

                                rows="4"

                                value={slotForm.advocateNotes}

                                onChange={(e) =>

                                    setSlotForm({

                                        ...slotForm,

                                        advocateNotes:

                                            e.target.value,

                                    })

                                }

                            />

                            <div className="modal-buttons">

                                <button

                                    className="approve-btn"

                                    onClick={async () => {

                                        try {

                                            await assignSlot(

                                                selectedAppointment._id,

                                                slotForm

                                            );

                                            alert(

                                                "Slot Assigned Successfully"

                                            );

                                            setShowSlotModal(false);

                                            setSelectedAppointment(null);

                                            setSlotForm({

                                                appointmentDate: "",

                                                appointmentTime: "",

                                                duration: 30,

                                                consultationFee: "",

                                                advocateNotes: "",

                                            });

                                            fetchAppointments();

                                        }

                                        catch (err) {

                                            console.log(err);

                                            alert(

                                                "Failed to Assign Slot"

                                            );

                                        }

                                    }}

                                >

                                    Confirm Slot

                                </button>

                                <button

                                    className="reject-btn"

                                    onClick={() => {

                                        setShowSlotModal(false);

                                        setSelectedAppointment(null);

                                    }}

                                >

                                    Cancel

                                </button>

                            </div>

                        </div>

                    </div>

                )

            }

        </div>

    );

}

export default AdvocateDashboard;