import UserDTO from './user.dto.js';

export class EventDTO {
  constructor(event) {
    this.id = (event._id || event.id).toString();
    this.title = event.title;
    this.description = event.description;
    this.category = event.category;
    if (event.sportType) {
      this.sportType = event.sportType;
    }
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;
    this.organizer = event.organizer ? UserDTO.summary(event.organizer) : null;
  }

  static from(event) {
    if (!event) return null;
    return new EventDTO(event);
  }

  static fromList(events = []) {
    return events.map((e) => EventDTO.from(e));
  }

  static summary(event) {
    if (!event) return null;
    if (typeof event === 'object' && event._bsontype !== 'ObjectId' && event.title) {
      return {
        id: (event._id || event.id).toString(),
        title: event.title,
        date: event.date,
        location: event.location,
        status: event.status
      };
    }
    return event.toString();
  }
}

export default EventDTO;
