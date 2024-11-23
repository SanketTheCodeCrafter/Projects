const taskInput = document.getElementById('taskInput');
        const columns = {
            notStarted: document.querySelector('#notStarted ul'),
            inProgress: document.querySelector('#inProgress ul'),
            done: document.querySelector('#done ul')
        };

        function addTask() {
            if (taskInput.value.trim() === '') return;

            const li = createTaskElement(taskInput.value);
            columns.notStarted.appendChild(li);
            taskInput.value = '';
        }

        function createTaskElement(taskText) {
            const li = document.createElement('li');
            li.className = 'fade-in not-started';
            li.draggable = true;
            li.innerHTML = `
                <div class="status-bar"><div class="status-progress"></div></div>
                <span>${taskText}</span>
                <div>
                    <button class="move-btn" onclick="moveTask(this)">Move</button>
                    <button onclick="removeTask(this)">Delete</button>
                </div>
            `;
            li.addEventListener('dragstart', dragStart);
            li.addEventListener('dragend', dragEnd);
            return li;
        }

        function removeTask(button) {
            button.closest('li').remove();
        }

        function moveTask(button) {
            const li = button.closest('li');
            const currentColumn = li.parentElement;
            let nextColumn;

            if (currentColumn === columns.notStarted) {
                nextColumn = columns.inProgress;
                li.className = 'fade-in in-progress';
            } else if (currentColumn === columns.inProgress) {
                nextColumn = columns.done;
                li.className = 'fade-in done';
            } else {
                nextColumn = columns.notStarted;
                li.className = 'fade-in not-started';
            }

            nextColumn.appendChild(li);
        }

        function dragStart(e) {
            this.classList.add('dragging');
        }

        function dragEnd(e) {
            this.classList.remove('dragging');
        }

        document.querySelectorAll('.column ul').forEach(column => {
            column.addEventListener('dragover', dragOver);
            column.addEventListener('drop', drop);
        });

        function dragOver(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(this, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                this.appendChild(draggable);
            } else {
                this.insertBefore(draggable, afterElement);
            }
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function drop(e) {
            const draggable = document.querySelector('.dragging');
            if (this === columns.notStarted) {
                draggable.className = 'fade-in not-started';
            } else if (this === columns.inProgress) {
                draggable.className = 'fade-in in-progress';
            } else if (this === columns.done) {
                draggable.className = 'fade-in done';
            }
        }

        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });