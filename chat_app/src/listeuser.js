
import { useEffect, useState } from "react";
import './App.css';

function ListUser() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/holi')
            .then(response => response.json())
            .then(data => {
                setUsers(data.users);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    return (
        <div>
            <h2>Chat Users</h2>

            {users.map(i => (
                <ul key={i.id}>
                    <li>{i.name}</li>
                    <li>{i.prenom}</li>
                    <li>{i.date_nais}</li>
                    <li>{i.country}</li>
                    <li>{i.email}</li>
                </ul>
            ))}
        </div>
    );
}

export default ListUser;
