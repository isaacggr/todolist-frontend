// Elementos DOM
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const usernameDisplay = document.getElementById('username-display');
const loginRegisterArea = document.getElementById('login-register-area');
const userInfo = document.getElementById('user-info');
const unauthenticatedContent = document.getElementById(
   'unauthenticated-content'
);
const authenticatedContent = document.getElementById('authenticated-content');
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskStart = document.getElementById('task-start');
const taskEnd = document.getElementById('task-end');
const taskPriority = document.getElementById('task-priority');
const tasksContainer = document.getElementById('tasks-container');
const filterPriority = document.getElementById('filter-priority');
const searchTask = document.getElementById('search-task');
const closeBtns = document.querySelectorAll('.close');

// Variáveis globais
let currentUser = null;
let tasks = [];
let currentEditingTask = null;

// Verifica se o usuário está logado ao carregar a página
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Event Listeners
loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));
logoutBtn.addEventListener('click', logout);
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
taskForm.addEventListener('submit', handleAddTask);
filterPriority.addEventListener('change', filterTasks);
searchTask.addEventListener('input', filterTasks);

closeBtns.forEach((btn) => {
   btn.addEventListener('click', () => {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
   });
});

// Fecha o modal ao clicar fora dele
window.addEventListener('click', (e) => {
   if (e.target === loginModal) {
      loginModal.style.display = 'none';
   } else if (e.target === registerModal) {
      registerModal.style.display = 'none';
   }
});

// Funções
function openModal(modal) {
   modal.style.display = 'block';
}

function formatDate(dateString) {
   const date = new Date(dateString);
   return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString(
      'pt-BR',
      { hour: '2-digit', minute: '2-digit' }
   )}`;
}

function showToast(message, isError = false) {
   const toast = document.getElementById('toast');
   toast.textContent = message;
   toast.style.backgroundColor = isError ? '#e63946' : '#2a9d8f';
   toast.className = 'show';

   setTimeout(() => {
      toast.className = toast.className.replace('show', '');
   }, 3000);
}

function checkAuthStatus() {
   const userData = localStorage.getItem('todolist_user');

   if (userData) {
      currentUser = JSON.parse(userData);
      updateUIForAuthenticatedUser();
      getTasks();
   } else {
      updateUIForUnauthenticatedUser();
   }
}

function updateUIForAuthenticatedUser() {
   loginRegisterArea.style.display = 'none';
   userInfo.style.display = 'flex';
   unauthenticatedContent.style.display = 'none';
   authenticatedContent.style.display = 'block';
   usernameDisplay.textContent = `Olá, ${
      currentUser.name || currentUser.username
   }`;
}

function updateUIForUnauthenticatedUser() {
   loginRegisterArea.style.display = 'flex';
   userInfo.style.display = 'none';
   unauthenticatedContent.style.display = 'block';
   authenticatedContent.style.display = 'none';
   currentUser = null;
}

async function handleLogin(e) {
   e.preventDefault();

   try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            username: loginUsername.value,
            password: loginPassword.value,
         }),
      });

      if (!response.ok) {
         throw new Error('Credenciais inválidas');
      }

      const userData = await response.json();

      // Armazena os dados do usuário no localStorage
      localStorage.setItem('todolist_user', JSON.stringify(userData));
      currentUser = userData;

      // Atualiza a UI
      updateUIForAuthenticatedUser();
      loginModal.style.display = 'none';
      loginForm.reset();

      // Busca as tarefas do usuário
      getTasks();

      showToast('Login realizado com sucesso!');
   } catch (error) {
      showToast(error.message || 'Erro ao fazer login', true);
   }
}

async function handleRegister(e) {
   e.preventDefault();

   try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            name: registerName.value,
            username: registerUsername.value,
            password: registerPassword.value,
         }),
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Erro ao cadastrar usuário');
      }

      const userData = await response.json();

      // Armazena os dados do usuário no localStorage
      localStorage.setItem('todolist_user', JSON.stringify(userData));
      currentUser = userData;

      // Atualiza a UI
      updateUIForAuthenticatedUser();
      registerModal.style.display = 'none';
      registerForm.reset();

      showToast('Cadastro realizado com sucesso!');
   } catch (error) {
      showToast(error.message || 'Erro ao cadastrar usuário', true);
   }
}

function logout() {
   localStorage.removeItem('todolist_user');
   updateUIForUnauthenticatedUser();
   showToast('Logout realizado com sucesso!');
}

async function getTasks() {
   if (!currentUser) return;

   try {
      console.log('Buscando tarefas para o usuário:', currentUser);

      // Verificando qual campo do objeto contém o ID do usuário
      const userId = currentUser.id || currentUser._id;

      if (!userId) {
         console.error('ID do usuário não encontrado no objeto:', currentUser);
         showToast('ID do usuário não encontrado', true);
         return;
      }

      console.log('ID do usuário utilizado:', userId);

      const response = await fetch(`${API_BASE_URL}/tasks/user/${userId}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      console.log('Resposta da API:', response);

      if (!response.ok) {
         const errorText = await response.text();
         console.error('Erro na resposta:', errorText);
         throw new Error(`Erro ao buscar tarefas: ${errorText}`);
      }

      tasks = await response.json();
      console.log('Tarefas recebidas:', tasks);
      renderTasks();
   } catch (error) {
      console.error('Erro completo:', error);
      showToast(error.message || 'Erro ao buscar tarefas', true);
   }
}

async function handleAddTask(e) {
   e.preventDefault();

   if (!currentUser) {
      showToast('Você precisa estar logado para adicionar tarefas', true);
      return;
   }

   try {
      // Verificando qual campo do objeto contém o ID do usuário
      const userId = currentUser.id || currentUser._id;

      if (!userId) {
         console.error('ID do usuário não encontrado no objeto:', currentUser);
         showToast('ID do usuário não encontrado', true);
         return;
      }

      console.log('Criando/editando tarefa para o usuário ID:', userId);

      const startDate = new Date(taskStart.value);
      const endDate = new Date(taskEnd.value);

      console.log('Data início:', startDate, 'Data fim:', endDate);

      const taskData = {
         title: taskTitle.value,
         description: taskDescription.value,
         startAt: startDate.toISOString(),
         endAt: endDate.toISOString(),
         priority: taskPriority.value,
         idUser: userId,
      };

      let url, method;

      // Se estiver editando, usa PUT, caso contrário, usa POST
      if (currentEditingTask) {
         url = `${API_BASE_URL}/tasks/${currentEditingTask}`;
         method = 'PUT';
         console.log('Atualizando tarefa existente:', currentEditingTask);
      } else {
         url = `${API_BASE_URL}/tasks/create`;
         method = 'POST';
         console.log('Criando nova tarefa');
      }

      console.log('Dados da tarefa:', taskData);

      const response = await fetch(url, {
         method: method,
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(taskData),
      });

      console.log('Resposta da API:', response);

      if (!response.ok) {
         const errorText = await response.text();
         console.error('Erro ao salvar tarefa:', errorText);
         throw new Error(
            `Erro ao ${
               currentEditingTask ? 'atualizar' : 'adicionar'
            } tarefa: ${errorText}`
         );
      }

      const taskResult = await response.json();
      console.log('Tarefa salva:', taskResult);

      // Se estiver editando, atualiza a tarefa na lista, caso contrário, adiciona
      if (currentEditingTask) {
         const index = tasks.findIndex(
            (task) => task.id === currentEditingTask
         );
         if (index !== -1) {
            tasks[index] = taskResult;
         }
         showToast('Tarefa atualizada com sucesso!');
      } else {
         tasks.push(taskResult);
         showToast('Tarefa adicionada com sucesso!');
      }

      // Resetar modo de edição
      currentEditingTask = null;

      // Atualizar botão
      document.querySelector('#task-form button[type="submit"]').textContent =
         'Adicionar Tarefa';

      // Resetar formulário e renderizar tarefas
      renderTasks();
      taskForm.reset();
      setDefaultDates();
   } catch (error) {
      console.error('Erro completo:', error);
      showToast(
         error.message ||
            `Erro ao ${currentEditingTask ? 'atualizar' : 'adicionar'} tarefa`,
         true
      );
   }
}

async function deleteTask(taskId) {
   if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

   try {
      console.log('Excluindo tarefa ID:', taskId);

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
         method: 'DELETE',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      console.log('Resposta da API para exclusão:', response);

      if (!response.ok) {
         const errorText = await response.text();
         console.error('Erro ao excluir tarefa:', errorText);
         throw new Error(`Erro ao excluir tarefa: ${errorText}`);
      }

      tasks = tasks.filter((task) => task.id !== taskId);
      renderTasks();

      showToast('Tarefa excluída com sucesso!');
   } catch (error) {
      console.error('Erro completo ao excluir:', error);
      showToast(error.message || 'Erro ao excluir tarefa', true);
   }
}

function editTask(taskId) {
   // Encontra a tarefa pelo ID
   const taskToEdit = tasks.find((task) => task.id === taskId);
   if (!taskToEdit) {
      showToast('Tarefa não encontrada', true);
      return;
   }

   console.log('Editando tarefa:', taskToEdit);

   // Preenche o formulário com os dados da tarefa
   taskTitle.value = taskToEdit.title;
   taskDescription.value = taskToEdit.description;

   // Formata as datas para o formato aceito pelo input datetime-local
   const startDate = new Date(taskToEdit.startAt);
   const endDate = new Date(taskToEdit.endAt);

   // Ajusta o fuso horário para exibição correta
   startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
   endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());

   taskStart.value = startDate.toISOString().slice(0, 16);
   taskEnd.value = endDate.toISOString().slice(0, 16);

   // Seleciona a prioridade
   taskPriority.value = taskToEdit.priority;

   // Define o ID da tarefa em edição
   currentEditingTask = taskId;

   // Altera o texto do botão
   document.querySelector('#task-form button[type="submit"]').textContent =
      'Atualizar Tarefa';

   // Rola a página até o formulário
   document.querySelector('.add-task').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
   // Limpa o formulário e reseta o modo de edição
   taskForm.reset();
   setDefaultDates();
   currentEditingTask = null;
   document.querySelector('#task-form button[type="submit"]').textContent =
      'Adicionar Tarefa';
}

function filterTasks() {
   const searchTerm = searchTask.value.toLowerCase();
   const priority = filterPriority.value;

   let filteredTasks = [...tasks];

   if (priority !== 'TODAS') {
      filteredTasks = filteredTasks.filter(
         (task) => task.priority === priority
      );
   }

   if (searchTerm) {
      filteredTasks = filteredTasks.filter(
         (task) =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
      );
   }

   renderTasks(filteredTasks);
}

function renderTasks(filteredTasks = tasks) {
   tasksContainer.innerHTML = '';

   if (filteredTasks.length === 0) {
      tasksContainer.innerHTML =
         '<p class="no-tasks">Nenhuma tarefa encontrada.</p>';
      return;
   }

   filteredTasks.forEach((task) => {
      const taskCard = document.createElement('div');
      taskCard.className = `task-card priority-${task.priority}`;

      taskCard.innerHTML = `
            <div class="task-header">
                <div>
                    <div class="task-title">${task.title}</div>
                    <span class="task-priority priority-${
                       task.priority
                    }">${getPriorityText(task.priority)}</span>
                </div>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-dates">
                <div><i class="fas fa-calendar-alt"></i> Início: ${formatDate(
                   task.startAt
                )}</div>
                <div><i class="fas fa-calendar-check"></i> Término: ${formatDate(
                   task.endAt
                )}</div>
            </div>
            <div class="task-actions">
                <button class="btn" onclick="editTask('${
                   task.id
                }')"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn danger" onclick="deleteTask('${
                   task.id
                }')"><i class="fas fa-trash"></i> Excluir</button>
            </div>
        `;

      tasksContainer.appendChild(taskCard);
   });
}

function getPriorityText(priority) {
   switch (priority) {
      case 'ALTA':
         return 'Alta';
      case 'MEDIA':
         return 'Média';
      case 'BAIXA':
         return 'Baixa';
      default:
         return priority;
   }
}

// Preenche os campos de data com data e hora atual
function setDefaultDates() {
   const now = new Date();
   const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora depois

   now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
   later.setMinutes(later.getMinutes() - later.getTimezoneOffset());

   taskStart.value = now.toISOString().slice(0, 16);
   taskEnd.value = later.toISOString().slice(0, 16);
}

setDefaultDates();

// Adicionar botão de cancelar edição no formulário
document.addEventListener('DOMContentLoaded', function () {
   const submitButton = document.querySelector(
      '#task-form button[type="submit"]'
   );
   const cancelButton = document.createElement('button');
   cancelButton.type = 'button';
   cancelButton.className = 'btn';
   cancelButton.textContent = 'Cancelar';
   cancelButton.style.marginLeft = '10px';
   cancelButton.addEventListener('click', cancelEdit);
   cancelButton.style.display = 'none'; // Inicialmente escondido

   // Atualiza a referência ao botão de cancelar sempre que mudar o modo de edição
   Object.defineProperty(window, 'currentEditingTask', {
      get: function () {
         return window._currentEditingTask;
      },
      set: function (value) {
         window._currentEditingTask = value;
         if (value) {
            cancelButton.style.display = 'inline-block';
         } else {
            cancelButton.style.display = 'none';
         }
      },
   });

   submitButton.parentNode.insertBefore(cancelButton, submitButton.nextSibling);
});
