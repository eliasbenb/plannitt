import React, { Component } from "react";

export default class UserPage extends Component {
  constructor(props) {
    super(props);
    this.unixify = this.unixify.bind(this);
  }

  unixify(value) {
    const day_list = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var day_index = day_list.indexOf(value.day, 0);
    var unix_time = (day_index * 24 + value.hour) * 3600;
    return unix_time;
  }

  render() {
    let { user } = this.props;

    return (
      <table>
        <thead>
          <tr>
            <td></td>
            <th>Sunday</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
          </tr>
        </thead>
        <tbody>
          {[
            "6:00 AM",
            "7:00 AM",
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "5:00 PM",
            "6:00 PM",
          ].map((t, n) => (
            <tr key={`${n}-${t}`}>
              <td className="heading">{t}</td>
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((a, b) =>
                user.find(this.unixify({ day: a, hour: n + 6 })) ? (
                  <td
                    onClick={() =>
                      user.remove(this.unixify({ day: a, hour: n + 6 }))
                    }
                    key={a}
                  >
                    ✔️
                  </td>
                ) : (
                  <td
                    onClick={() =>
                      user.add({
                        day: a,
                        hour: n + 6,
                        time: `${a}, ${n + 6} ${n < 6 ? "AM" : "PM"}`,
                        unix_time: this.unixify({ day: a, hour: n + 6 }),
                      })
                    }
                    key={a}
                  ></td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
