import { useState } from "react";

export default function SeatBox({ room, capacity, setSelectedRooms, setSeatSelected, bookedRooms }) {
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = () => {
        setIsChecked(!isChecked);
        if (!isChecked) {
            setSelectedRooms(prev => [...prev, room]);
            setSeatSelected(prev => prev + capacity);
        } else {
            setSelectedRooms(prev => prev.filter(item => item !== room));
            setSeatSelected(prev => prev - capacity);
        }
    };

    const isBooked = bookedRooms.length > 0 && bookedRooms.includes(room);
    const backgroundClass = isBooked
        ? 'bg-red-500'
        : isChecked
            ? 'bg-green-500'
            : 'bg-grey-all';

    const capacityTextClass = isBooked
        ? 'text-white'
        : isChecked
            ? 'text-white'
            : 'text-green-save';

    return (
        <div
            className={`inline-grid place-items-center ${backgroundClass} w-16 h-16 border rounded-2xl m-2 py-2 cursor-pointer`}
            onClick={isBooked ? null : handleChange}
        >
            <p className="font-Outfit-Bold cursor-pointer select-none">{room}</p>
            <p className={`font-Outfit-Bold ${capacityTextClass} cursor-pointer select-none`}>{capacity}</p>
        </div>
    );
}
