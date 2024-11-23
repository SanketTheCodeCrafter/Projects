document.addEventListener('DOMContentLoaded', function () {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');
    const dateDisplay = document.getElementById('date-display');
    const weeklyGrid = document.getElementById('weekly-grid');
    const monthlyGrid = document.getElementById('monthly-grid');
    const analyticsContent = document.getElementById('analytics-content');
    const notification = document.getElementById('notification');
    const weeklyToggle = document.getElementById('weekly-toggle');
    const monthlyToggle = document.getElementById('monthly-toggle');
    const weeklyView = document.getElementById('weekly-view');
    const monthlyView = document.getElementById('monthly-view');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const enableReminders = document.getElementById('enable-reminders');
    const reminderTime = document.getElementById('reminder-time');

    let currentDate = new Date();
    let habits = {};

    updateDateDisplay();
    loadHabits();
    renderHabitList();
    renderWeeklyView();
    renderMonthlyView();
    setupNavigation();
    setupThemeSelector();
    setupReminderSettings();

    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    weeklyToggle.addEventListener('click', () => toggleAnalyticsView('weekly'));
    monthlyToggle.addEventListener('click', () => toggleAnalyticsView('monthly'));

    function updateDateDisplay() {
        dateDisplay.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function addHabit() {
        const habitText = habitInput.value.trim();
        if (habitText !== '') {
            if (!habits[habitText]) {
                habits[habitText] = { streak: 0, lastCompleted: null, completedDates: [] };
                saveHabits();
                renderHabitList();
                renderWeeklyView();
                renderMonthlyView();
                habitInput.value = '';
                showNotification('Habit added successfully!');
            } else {
                showNotification('This habit already exists!');
            }
        }
    }

    function renderHabitList() {
        habitList.innerHTML = '';
        for (let habit in habits) {
            const habitItem = createHabitElement(habit);
            habitList.appendChild(habitItem);
        }
    }

    function createHabitElement(habitText) {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
            <input type="checkbox" id="${habitText}" ${isHabitCompletedToday(habitText) ? 'checked' : ''}>
            <label for="${habitText}">${habitText}</label>
            <button class="edit-btn"><i class="fas fa-edit"></i></button>  <!-- Add Edit Button -->
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;
    
        // Handle checkbox for marking habits as completed
        const checkbox = habitItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            toggleHabitCompletion(habitText, this.checked);
        });
    
        // Handle the delete functionality
        habitItem.querySelector('.delete-btn').addEventListener('click', function() {
            deleteHabit(habitText);
        });
    
        // Handle the edit functionality
        habitItem.querySelector('.edit-btn').addEventListener('click', function() {
            editHabit(habitText);
        });
    
        return habitItem;
    }

    function editHabit(oldHabitText) {
        const newHabitText = prompt("Enter the new name for this habit:", oldHabitText);
        
        if (newHabitText && newHabitText.trim() !== '') {
            // Check if the new habit name already exists
            if (habits[newHabitText]) {
                showNotification("A habit with this name already exists!");
                return;
            }
    
            // Update habit in the habits object
            habits[newHabitText] = { ...habits[oldHabitText] };  // Copy the old habit data to the new habit
            delete habits[oldHabitText];  // Remove the old habit
    
            // Save the updated habits to localStorage
            saveHabits();
    
            // Re-render the habit list, weekly view, and monthly view
            renderHabitList();
            renderWeeklyView();
            renderMonthlyView();
            
            showNotification("Habit name updated successfully!");
        } else {
            showNotification("Habit name cannot be empty!");
        }
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
    

    function toggleHabitCompletion(habit, completed) {
        if (completed) {
            habits[habit].lastCompleted = currentDate.toDateString();
            habits[habit].streak++;
            habits[habit].completedDates.push(currentDate.toDateString());
            showNotification('Habit completed! Keep it up!');
        } else {
            if (habits[habit].lastCompleted === currentDate.toDateString()) {
                habits[habit].lastCompleted = null;
                habits[habit].streak = Math.max(0, habits[habit].streak - 1);
                habits[habit].completedDates = habits[habit].completedDates.filter(date => date !== currentDate.toDateString());
            }
        }
        saveHabits();
        renderWeeklyView();
        renderMonthlyView();
        renderAnalytics(habit);
    }

    function deleteHabit(habitText) {
        delete habits[habitText];
        saveHabits();
        renderHabitList();
        renderWeeklyView();
        renderMonthlyView();
        showNotification('Habit deleted successfully!');
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
        }
    }

    function renderWeeklyView() {
        const weeklyGrid = document.getElementById('weekly-performance-grid');
        weeklyGrid.innerHTML = '';  // Clear the previous weekly grid
    
        const daysOfWeek = getDaysOfWeek();
        let totalCompletedHabits = 0;
    
        // Iterate over each habit and show the completion status for each day of the current week
        for (let habit in habits) {
            const habitCompletion = daysOfWeek.map(day => isHabitCompletedOnDay(habit, day));
            totalCompletedHabits += habitCompletion.filter(Boolean).length;
    
            habitCompletion.forEach((completed, index) => {
                const dayCard = document.createElement('div');
                dayCard.className = `weekly-day-card ${completed ? 'completed' : 'missed'}`;
                dayCard.innerHTML = `
                    <div class="day-name">${daysOfWeek[index]}</div>
                    <div class="habit-name">${habit}</div> <!-- Show habit name -->
                    <div class="habit-status">
                        <i class="fas ${completed ? 'fa-check status-icon' : 'fa-times status-icon'}"></i>
                    </div>
                    <div class="streak-info">Streak: ${habits[habit].streak} days</div>
                `;
                weeklyGrid.appendChild(dayCard);
            });
        }
    
        // Display overview of weekly performance
        const overview = document.getElementById('weekly-overview');
        overview.innerHTML = `Total Completed Habits: ${totalCompletedHabits}`;
    }
    
    function getStartOfWeek(date) {
        const currentDate = new Date(date);
        const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Get Sunday
        return new Date(currentDate.setDate(firstDayOfWeek)); // Return the start of the week (Sunday)
    }
    
    function getDaysOfWeek() {
        const startOfWeek = getStartOfWeek(currentDate);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map((day, index) => {
            const weekDay = new Date(startOfWeek);
            weekDay.setDate(startOfWeek.getDate() + index); // Add the index to get the date for each day of the week
            return weekDay.toDateString();
        });
    }

    function isHabitCompletedOnDay(habit, day) {
        const targetDate = new Date(day); // Day will now be the date string for the current week
        return habits[habit].completedDates.includes(targetDate.toDateString());
    }
    
    

    function renderMonthlyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const summaryGrid = document.getElementById('monthly-summary-grid');
        summaryGrid.innerHTML = '';  // Clear the previous summaries
    
        for (let habit in habits) {
            const completionsThisMonth = getCompletionsForMonth(habit, year, month);
            const completionPercentage = (completionsThisMonth / daysInMonth) * 100;
            const longestStreak = getLongestStreak(habit);
            
            // Create a card for each habit's monthly summary
            const habitCard = document.createElement('div');
            habitCard.className = 'monthly-summary-card';
            habitCard.innerHTML = `
                <h3>${habit}</h3>
                <div class="streak">Longest Streak: ${longestStreak} days</div>
                <div class="completion-percentage">${completionPercentage.toFixed(1)}% completed</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${completionPercentage}%"></div>
                </div>
                <div class="insight">You completed this habit ${completionsThisMonth} out of ${daysInMonth} days.</div>
            `;
            summaryGrid.appendChild(habitCard);
        }
    }
    
    function getCompletionsForMonth(habit, year, month) {
        return habits[habit].completedDates.filter(dateString => {
            const date = new Date(dateString);
            return date.getFullYear() === year && date.getMonth() === month;
        }).length;
    }
    
    function getLongestStreak(habit) {
        let maxStreak = 0;
        let currentStreak = 0;
    
        habits[habit].completedDates.forEach((dateString, index, dates) => {
            const currentDate = new Date(dateString);
            const previousDate = new Date(dates[index - 1] || '');
            
            if (index === 0 || (currentDate - previousDate) === 86400000) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
    
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
            }
        });
    
        return maxStreak;
    }
    

    function isHabitCompletedOnDate(habit, date) {
        return habits[habit].completedDates.some(completedDate =>
            new Date(completedDate).toDateString() === date.toDateString()
        );
    }

    function getDaysOfWeek() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = currentDate.getDay();
        return [...days.slice(today), ...days.slice(0, today)];
    }

    function isHabitCompletedOnDay(habit, day) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - getDaysOfWeek().indexOf(day));
        return habits[habit].completedDates.includes(date.toDateString());
    }

    function isHabitCompletedOnDate(habit, date) {
        return habits[habit].completedDates.includes(date.toDateString());
    }

    function renderAnalytics(habit) {
        analyticsContent.innerHTML = `
            <h3>${habit}</h3>
            <div class="streak-info">Current Streak: ${habits[habit].streak} days</div>
            <h4>Completed Dates:</h4>
            <div class="completed-dates">
                ${habits[habit].completedDates.map(date => `
                    <span class="completed-date">${new Date(date).toLocaleDateString()}</span>
                `).join('')}
            </div>
        `;
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                const targetId = this.dataset.target;
                pages.forEach(page => page.classList.remove('active'));
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
                this.classList.add('active');
            });
        });
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function toggleAnalyticsView(view) {
        if (view === 'weekly') {
            weeklyToggle.classList.add('active');
            monthlyToggle.classList.remove('active');
            weeklyView.style.display = 'block';
            monthlyView.style.display = 'none';
        } else {
            weeklyToggle.classList.remove('active');
            monthlyToggle.classList.add('active');
            weeklyView.style.display = 'none';
            monthlyView.style.display = 'block';
        }
    }

    function setupThemeSelector() {
        themeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const theme = this.dataset.theme;
                document.body.className = theme === 'default' ? '' : `${theme}-theme`;
                localStorage.setItem('theme', theme);
            });
        });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme === 'default' ? '' : `${savedTheme}-theme`;
        }
    }

    function setupReminderSettings() {
        enableReminders.addEventListener('change', function () {
            localStorage.setItem('remindersEnabled', this.checked);
            reminderTime.disabled = !this.checked;
            if (this.checked) {
                scheduleReminder();
            }
        });

        reminderTime.addEventListener('change', function () {
            localStorage.setItem('reminderTime', this.value);
            if (enableReminders.checked) {
                scheduleReminder();
            }
        });

        const remindersEnabled = localStorage.getItem('remindersEnabled') === 'true';
        enableReminders.checked = remindersEnabled;
        reminderTime.disabled = !remindersEnabled;

        const savedReminderTime = localStorage.getItem('reminderTime');
        if (savedReminderTime) {
            reminderTime.value = savedReminderTime;
        }

        if (remindersEnabled) {
            scheduleReminder();
        }
    }

    function scheduleReminder() {
        const [hours, minutes] = reminderTime.value.split(':');
        const now = new Date();
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (reminderDate <= now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }

        const timeUntilReminder = reminderDate - now;

        setTimeout(() => {
            showNotification("Don't forget to check your habits!");
            scheduleReminder(); // Schedule the next reminder
        }, timeUntilReminder);
    }

    let notificationTimeout;
    function showNotification(message) {
        clearTimeout(notificationTimeout);  // Clear any existing timeout
        notification.textContent = message;
        notification.classList.add('show');
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

});