document.addEventListener('DOMContentLoaded', function() {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const dateDisplay = document.getElementById('date-display');
    const streakInfo = document.getElementById('streak-info');
    const calendarGrid = document.getElementById('calendar-grid');

    let currentDate = new Date();
    let habits = {};

    updateDateDisplay();
    loadHabits();
    updateStreakInfo();
    renderCalendar();

    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    function updateDateDisplay() {
        dateDisplay.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function addHabit() {
        if (habitInput.value.trim() !== '') {
            const habitText = habitInput.value.trim();
            if (!habits[habitText]) {
                habits[habitText] = { streak: 0, lastCompleted: null, completedDates: [] };
                createHabitElement(habitText);
                saveHabits();
                habitInput.value = '';
                renderCalendar();
                
                // Animation for new habit
                const newHabit = habitList.lastElementChild;
                newHabit.style.opacity = '0';
                newHabit.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    newHabit.style.opacity = '1';
                    newHabit.style.transform = 'translateY(0)';
                }, 10);
            } else {
                showNotification('This habit already exists!');
            }
        }
    }

    function createHabitElement(habitText) {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
            <input type="checkbox" id="${habitText}" ${isHabitCompletedToday(habitText) ? 'checked' : ''}>
            <label for="${habitText}">${habitText}</label>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;
        habitList.appendChild(habitItem);

        const checkbox = habitItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            toggleHabitCompletion(habitText, this.checked);
        });

        habitItem.querySelector('.delete-btn').addEventListener('click', function() {
            deleteHabit(habitItem, habitText);
        });
    }

    function toggleHabitCompletion(habit, completed) {
        const label = document.querySelector(`label[for="${habit}"]`);
        if (completed) {
            label.classList.add('completed');
            habits[habit].lastCompleted = currentDate.toDateString();
            habits[habit].streak++;
            habits[habit].completedDates.push(currentDate.toDateString());
            showNotification('Habit completed! Keep it up!');
        } else {
            label.classList.remove('completed');
            if (habits[habit].lastCompleted === currentDate.toDateString()) {
                habits[habit].lastCompleted = null;
                habits[habit].streak = Math.max(0, habits[habit].streak - 1);
                habits[habit].completedDates = habits[habit].completedDates.filter(date => date !== currentDate.toDateString());
            }
        }
        saveHabits();
        updateStreakInfo();
        renderCalendar();
    }

    function deleteHabit(habitElement, habitText) {
        habitElement.style.opacity = '0';
        habitElement.style.transform = 'translateX(20px)';
        setTimeout(() => {
            habitList.removeChild(habitElement);
            delete habits[habitText];
            saveHabits();
            updateStreakInfo();
            renderCalendar();
        }, 300);
    }

    function isHabitCompletedToday(habit) {
        return habits[habit].lastCompleted === currentDate.toDateString();
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function loadHabits() {
        const savedHabits = localStorage.getItem('habits');
        if (savedHabits) {
            habits = JSON.parse(savedHabits);
            for (let habit in habits) {
                createHabitElement(habit);
            }
        }
    }

    function updateStreakInfo() {
        let longestStreak = 0;
        let longestStreakHabit = '';
        for (let habit in habits) {
            if (habits[habit].streak > longestStreak) {
                longestStreak = habits[habit].streak;
                longestStreakHabit = habit;
            }
        }
        streakInfo.textContent = longestStreak > 0 ? 
            `🔥 Longest streak: ${longestStreak} days (${longestStreakHabit})` : 
            '🚀 Start your first streak by completing a habit!';
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayNameElement = document.createElement('div');
            dayNameElement.className = 'calendar-day day-name';
            dayNameElement.textContent = day;
            calendarGrid.appendChild(dayNameElement);
        });

        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarGrid.appendChild(createCalendarDay(''));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = createCalendarDay(i);
            const date = new Date(year, month, i).toDateString();
            if (date === currentDate.toDateString()) {
                day.classList.add('today');
            }
            if (Object.values(habits).some(habit => habit.completedDates.includes(date))) {
                day.classList.add('completed');
            }
            calendarGrid.appendChild(day);
        }
    }

    function createCalendarDay(content) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = content;
        return day;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
});