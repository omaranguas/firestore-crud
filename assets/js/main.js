const db = firebase.firestore(), d = document, w = window;

const taskForm = d.getElementById('task-form'), taskContainer = d.getElementById('task-container');

let updateStatus = false, id = '';

const saveTask = (title, description) => db.collection('tasks').doc().set({ title, description });

/* const getTasks = () => db.collection('tasks').get(); */

const getTask = (id) => db.collection('tasks').doc(id).get();

const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback);

const removeTask = (id) => db.collection('tasks').doc(id).delete();

const updateTask = (id, updateTask) => db.collection('tasks').doc(id).update(updateTask);

w.addEventListener('DOMContentLoaded', async (e) => {
    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            task.id = doc.id;
            taskContainer.innerHTML += `
            <div class="card card-body p-4 mb-3">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <div>
                    <button class="btn btn-primary btn-update" data-id="${task.id}">Update</button>
                    <button class="btn btn-danger btn-remove" data-id="${task.id}">Remove</button>
                </div>
            </div>`

            const btnUpdate = d.querySelectorAll('.btn-update');
            const btnRemove = d.querySelectorAll('.btn-remove');
            btnUpdate.forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset.id);
                    const task = doc.data();
                    updateStatus = true;
                    id = doc.id;
                    taskForm.innerHTML += '<button id="btn-cancel" class="btn btn-secondary">Cancel</button>';
                    taskForm['task-title'].value = task.title;
                    taskForm['task-description'].value = task.description;
                    taskForm['btn-task'].innerText = 'Update';
                    
                    w.scrollTo({
                        behavior: 'smooth',
                        top: 0
                    });

                    if (updateStatus) {
                        btnUpdate.forEach((btn) => btn.setAttribute('disabled', 'true'));
                        btnRemove.forEach((btn) => btn.setAttribute('disabled', 'true'));
                    }

                    const btnUpdateTask = d.getElementById('btn-task');
                    btnUpdateTask.addEventListener('click', (e) => {
                        btnUpdate.forEach((btn) => btn.removeAttribute('disabled'));
                        btnRemove.forEach((btn) => btn.removeAttribute('disabled'));
                    });

                    const btnCancel = d.getElementById('btn-cancel');
                    btnCancel.addEventListener('click', (e) => {
                        taskForm.removeChild(btnCancel);
                        taskForm['task-title'].value = '';
                        taskForm['task-description'].value = '';
                        taskForm['btn-task'].innerText = 'Save task';
                        updateStatus = false;
                        btnUpdate.forEach((btn) => btn.removeAttribute('disabled'));
                        btnRemove.forEach((btn) => btn.removeAttribute('disabled'));
                    });
                });
            });
            btnRemove.forEach((btn) => btn.addEventListener('click', async (e) => await removeTask(e.target.dataset.id)));
        });
    });
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskForm['task-title'], description = taskForm['task-description'];

    if (!updateStatus)
        await saveTask(title.value, description.value);
    else {
        await updateTask(id, { title: title.value, description: description.value });
        updateStatus = false;
        id = '';
        taskForm['btn-task'].innerText = 'Save task';
        taskForm.removeChild(taskForm['btn-cancel']);
    }
    taskForm.reset();
    title.focus();
});