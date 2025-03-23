import { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css"; 

// app function, component holds data//

function App() {
  const [subscriptions, setSubscriptions] = useState([]);     // holds item
  const [formData, setFormData] = useState({           // hold information of each item
    name: "",
    price: "",
    billing_date: "",
    frequency: "monthly",
  });

  const [notification, setNotification] = useState("");  // holds notification text

  useEffect(() => {           // fetches saved subscriptions from previous session
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {            
    try {
      const res = await axios.get("http://127.0.0.1:5000/subscriptions");    // component that acquires data from backend
      setSubscriptions(res.data);               // updates data to previous state
    } catch (error) {                         
      console.error("Error fetching subscriptions:", error);               // error log
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 3000); // hide after 3 seconds
  };

  const handleChange = (e) => {                     
    const { name, value } = e.target;         // set field name value
    setFormData((prev) => ({ ...prev, [name]: value }));     // update field name data
  };
 
  const handleSubmit = async (e) => {                   // function for Adding
    e.preventDefault();                        // stop page from reloading, maintain data
    try {                                        //  handling error
      await axios.post("http://127.0.0.1:5000/subscriptions", formData);            // sends input to backend to save the data, waits to be finished
      fetchSubscriptions(); 
      setFormData({                               // data form
        name: "",
        price: "",
        billing_date: "",
        frequency: "monthly",
      });
      showNotification("✅ Item added!");  // notification here
    } catch (error) {
      console.error("Error adding subscription:", error);                  // debug log statement
    }
  };

  const handleDelete = async (id) => {         // adding DELETE functionality
    try {
      await axios.delete(`http://127.0.0.1:5000/subscriptions/${id}`);           // sends the delete request to db
      fetchSubscriptions();                                                        // refreshes list with item removed
      showNotification("🗑️ Subscription deleted!");  // notification here
    } catch (error) {                                                            // error handling
      console.error("Error deleting subscription:", error);
    }
  };

  const totalMonthly = subscriptions                              // adding total logic
    .filter((sub) => sub.frequency === "monthly")
    .reduce((acc, sub) => acc + parseFloat(sub.price), 0);

  return (                             // return statement, display app
    <div className="app-container"> {/* controller */}

      {notification && (     // show notification if it exists
        <div className="notification">
          {notification}
        </div>
      )}

      <h1 className="app-title">Billing Bird 🕊️</h1>   {/* title header, re-edit name later */}

      {/* add/remove items */}
      <form className="subscription-form" onSubmit={handleSubmit}>
        {/* collect user input */}

        {/* input box */}
        <input
          type="text"
          name="name"
          placeholder="Subscription Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* input box, type price of item */}
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        {/* input box, choose the date of billing */}
        <input
          type="date"
          name="billing_date"
          value={formData.billing_date}
          onChange={handleChange}
          required
        />

        {/* select monthly or yearly */}
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button type="submit" className="add-btn">Add Subscription</button>
      </form>

      {/* content */}
      <div className="content-container">
        {/* item list */}
        <div className="subscriptions-list">
          <h2>Your items</h2>
          {subscriptions.length === 0 ? (
            <p>No items yet.</p>
          ) : (
            <ul>
              {subscriptions.map((sub) => (
                <li key={sub.id} className="subscription-item">
                  <strong>{sub.name}</strong> - ${sub.price} / {sub.frequency}<br />
                  Next bill: {sub.billing_date}<br />
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* payment calendar structure */}
        <div className="calendar-container">
          <h2>Payment Calendar</h2>
          <Calendar
            className="custom-calendar"
            tileContent={({ date, view }) => {
              if (view !== "month") return null;

              const day = date.getDate();
              const month = date.getMonth();
              const year = date.getFullYear();

              const subsDue = subscriptions.filter((sub) => {
                const [subYear, subMonth, subDay] = sub.billing_date
                  .split("-")
                  .map(Number);

                if (sub.frequency === "monthly") {
                  return (
                    day === subDay &&
                    (year > subYear || (year === subYear && month >= subMonth))
                  );
                }

                if (sub.frequency === "yearly") {
                  return (
                    day === subDay &&
                    month === subMonth &&
                    year >= subYear
                  );
                }

                return (
                  day === subDay &&
                  month === subMonth &&
                  year === subYear
                );
              });

              return subsDue.length ? (
                <p className="calendar-icon">💵</p>         // add money icon to calendar for specific days
              ) : null;
            }}
          />
        </div>
      </div>

      {/* monthly cost */}
      <div className="total-container">
        <h2>Total Monthly Cost: ${totalMonthly.toFixed(2)}</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(totalMonthly, 500)}px`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default App;
