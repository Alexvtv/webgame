import { useNavigate } from "react-router";

export const MainPage = () => {
    const navigate = useNavigate();
    return <div>
        main

        <button onClick={() => navigate("/game")}>Играть</button>
    </div>
}