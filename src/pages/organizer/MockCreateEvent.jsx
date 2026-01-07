import React, { useState } from 'react';
import { HiPlus, HiTrash, HiLightningBolt } from 'react-icons/hi';

// 0. MOCK DATA DEFINITION
// This is the data we want to "poof" into existence when we click the button.


export default function MockCreateEvent() {

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    category: 'concert',
    venue: { name: '', address: '', city: '', state: '', country: 'Nigeria' },
    eventDate: '',
    ticketTiers: [{ name: 'General Admission', price: 5000, quantity: 100, maxPerUser: 4 }]
  });

  console.log(formData);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('venue.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        venue: { ...prev.venue, [field]: value }
      }));
    } else if (name.startsWith('eventDate')) {
      setFormData(prev => ({ ...prev, eventDate: value.toLocaleString()-3 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
 

    return (
        <div className="p-8 max-w-4xl mx-auto grid grid-cols-2 gap-8">
           <div className="">
            <h1>Mock Event Details</h1>
            <div className=' flex flex-col gap-4'>
              <div className=" ">
              <label>Event Title *</label>  
              <input type="text" placeholder="Event Title" name='title' />
              </div>
              <div className=" ">
              <label>Artist/performer </label>  
              <input type="text" placeholder="Artist/performer" name='artist' onChange={handleChange}/>
              </div>
              <div>
              <label>Category </label>  
              <select name="category" >
                                    <option value="concert">Concert</option>
                                    <option value="festival">Festival</option>
                                    <option value="theater">Theater</option>
                                    <option value="sports">Sports</option>
                                    <option value="conference">Conference</option>
                                    <option value="other">Other</option>
                                </select>
              </div>
              <div>
                <label>Venue</label>
                <input type="text" placeholder="Venue" name='venue.name' onChange={handleChange}/>
              </div>
              <div>
                <label>Event Date & Time *</label>
                <input type="datetime-local" placeholder="Event Date & Time" name='eventDate' onChange={handleChange} />
              </div>
              <div>
                <label> Tier</label>
                <div>
                  
                </div>
              </div>
            </div>
           </div>
           <div className=' bg-black text-white'>
            <pre >
              {JSON.stringify(formData, null, 2)}
            </pre>
           </div>
        </div>
    );
}
