import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './App.css';

interface GameType {
  id: string;
  name: string;
  color: string;
}

interface GameEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  gameTypeId: string;
}

function App() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const calendarRef = useRef<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [tempEvent, setTempEvent] = useState<{title: string; description: string; gameTypeId: string; start: string; end: string} | null>(null);

  const handleDateClick = (arg: any) => {
    if (!isAddMode) return;

    if (!selectedStartDate) {
      setSelectedStartDate(arg.dateStr);
    } else {
      const startDate = new Date(selectedStartDate);
      const endDate = new Date(arg.dateStr);

      if (startDate <= endDate) {
        setTempEvent({
          title: '',
          description: '',
          gameTypeId: '',
          start: selectedStartDate,
          end: arg.dateStr
        });
        setShowModal(true);
      } else {
        alert('종료일이 시작일보다 빠를 수 없습니다.');
      }
      setSelectedStartDate(null);
    }
  };

  const handleGameTypeAdd = (name: string, color: string) => {
    const newGameType: GameType = {
      id: Date.now().toString(),
      name: name.trim(),
      color: color
    };
    setGameTypes([...gameTypes, newGameType]);
  };

  const handleModalSubmit = (title: string, description: string, gameTypeId: string) => {
    if (tempEvent && title.trim() && gameTypeId) {
      const selectedGameType = gameTypes.find(type => type.id === gameTypeId);
      const newEvent: GameEvent = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        gameTypeId: gameTypeId,
        start: tempEvent.start,
        end: tempEvent.end
      };
      setEvents([...events, newEvent]);
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.addEvent({
          id: newEvent.id,
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          backgroundColor: selectedGameType?.color,
          extendedProps: {
            description: newEvent.description,
            gameTypeName: selectedGameType?.name
          }
        });
      }
    }
    setShowModal(false);
    setTempEvent(null);
  };

  const handleEventClick = (info: any) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(info.event.start);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <div className="header-left">
          <button
            className={`event-list-btn ${showEventList ? 'active' : ''}`}
            onClick={() => setShowEventList(!showEventList)}
          >
            {showEventList ? '목록 닫기' : '이벤트 목록'}
          </button>
          <button
            className="settings-btn"
            onClick={() => setShowSettingsModal(true)}
          >
            설정
          </button>
        </div>
        <h1>게임 이벤트 캘린더</h1>
        <button
          className={`add-mode-btn ${isAddMode ? 'active' : ''}`}
          onClick={() => {
            setIsAddMode(!isAddMode);
            setSelectedStartDate(null);
          }}
        >
          {isAddMode ? '일반 모드' : '이벤트 추가'}
        </button>
      </div>

      <div className="main-content">
        {showEventList && (
          <div className="event-list-sidebar">
            <h2>이벤트 목록</h2>
            {events.map(event => (
              <div
                key={event.id}
                className="event-item"
                onClick={() => handleEventClick({ event })}
                style={{ 
                  borderLeftColor: gameTypes.find(type => type.id === event.gameTypeId)?.color || '#ddd'
                }}
              >
                <div className="event-info">
                  <div className="event-header">
                    <span className="event-title">{event.title}</span>
                    <span className="event-description-inline">{event.description}</span>
                  </div>
                  <span className="event-game-type">
                    {gameTypes.find(type => type.id === event.gameTypeId)?.name}
                  </span>
                  <span className="event-date">{event.start} ~ {event.end}</span>
                  <span className="event-description-full">{event.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`calendar-container ${showEventList ? 'with-sidebar' : ''}`}>
          {isAddMode && !selectedStartDate && (
            <div className="add-mode-instruction">시작 날짜를 선택하세요</div>
          )}
          {isAddMode && selectedStartDate && (
            <div className="add-mode-instruction">종료 날짜를 선택하세요</div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            dateClick={handleDateClick}
            events={events.map(event => {
              const gameType = gameTypes.find(type => type.id === event.gameTypeId);
              return {
                id: event.id,
                title: `${event.title} - ${event.description}`,
                start: event.start,
                end: event.end,
                backgroundColor: gameType?.color,
                borderColor: gameType?.color,
                textColor: '#ffffff',
                extendedProps: {
                  description: event.description,
                  gameTypeName: gameType?.name
                }
              };
            })}
            eventClick={handleEventClick}
            locale="ko"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            eventDidMount={(info) => {
              info.el.title = `${info.event.extendedProps.gameTypeName}\n${info.event.extendedProps.description}`;
            }}
          />
        </div>
      </div>

      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>게임 종류 설정</h2>
            <div className="game-type-form">
              <input
                type="text"
                placeholder="게임 이름"
                className="game-type-input"
                id="gameTypeName"
              />
              <input
                type="color"
                className="color-picker"
                id="gameTypeColor"
                defaultValue="#4a90e2"
              />
              <button
                onClick={() => {
                  const nameInput = document.getElementById('gameTypeName') as HTMLInputElement;
                  const colorInput = document.getElementById('gameTypeColor') as HTMLInputElement;
                  if (nameInput.value.trim()) {
                    handleGameTypeAdd(nameInput.value, colorInput.value);
                    nameInput.value = '';
                    colorInput.value = '#4a90e2';
                  }
                }}
              >
                추가
              </button>
            </div>
            <div className="game-type-list">
              {gameTypes.map(type => (
                <div key={type.id} className="game-type-item" style={{ backgroundColor: type.color }}>
                  {type.name}
                </div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowSettingsModal(false)}>닫기</button>
          </div>
        </div>
      )}

      {showModal && tempEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>새 이벤트 추가</h2>
            <div className="event-form">
              <input
                type="text"
                placeholder="이벤트 제목"
                className="event-input"
                id="eventTitle"
                autoFocus
              />
              <select className="game-type-select" id="eventGameType">
                <option value="">게임 종류 선택</option>
                {gameTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <textarea
                placeholder="이벤트 설명"
                className="event-description"
                id="eventDescription"
              />
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    const titleInput = document.getElementById('eventTitle') as HTMLInputElement;
                    const gameTypeSelect = document.getElementById('eventGameType') as HTMLSelectElement;
                    const descriptionInput = document.getElementById('eventDescription') as HTMLTextAreaElement;
                    if (titleInput.value.trim() && gameTypeSelect.value) {
                      handleModalSubmit(titleInput.value, descriptionInput.value, gameTypeSelect.value);
                    }
                  }}
                >
                  완료
                </button>
                <button className="cancel-btn" onClick={() => {
                  setShowModal(false);
                  setTempEvent(null);
                }}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
