export async function fetchMap(path) {
    try {
        const resp = await fetch(path);
        return await resp.json();
    } catch (error) {
        console.error(error.message);
    }
}

export function createMenu(game, div) {
    // menu style
    div.classList.add('menu');
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.visibility = 'hidden';
    div.style.position = 'fixed';
    div.style.width = '500px';
    div.style.height = '400px';
    div.style.backgroundColor = '#c1e1ec';
    div.style.border = '2px solid';
    div.style.zIndex = '1000';
    // title
    const title = document.createElement('h3');
    title.innerHTML = 'Pause';
    div.appendChild(title);
    // hr
    const hr = document.createElement('hr');
    hr.style.width = '100%';
    div.appendChild(hr);
    // resume
    const resume = document.createElement('span');
    resume.innerHTML = 'Resume';
    resume.style.margin = '50px 0';
    resume.style.padding = '10px';
    resume.style.border = '2px solid';
    resume.addEventListener('mouseover', () => {
        resume.style.backgroundColor = 'lightblue';
    });
    resume.addEventListener('mouseout', () => {
        resume.style.backgroundColor = 'transparent';
    });
    resume.addEventListener('click', () => {
        game.paused = false;
    });
    div.appendChild(resume);
    // restart
    const restart = document.createElement('span');
    restart.innerHTML = 'Restart';
    restart.style.padding = '10px';
    restart.style.border = '2px solid';
    restart.addEventListener('mouseover', () => {
        restart.style.backgroundColor = 'lightblue';
    });
    restart.addEventListener('mouseout', () => {
        restart.style.backgroundColor = 'transparent';
    });
    restart.addEventListener('click', () => {
        game.paused = false;
        game.restart();
    });
    div.appendChild(restart);
}

export function createMainMenu(gameInstance, container) {
    // Créer le conteneur du menu
    const menuContainer = document.createElement('div');
    menuContainer.style.position = 'fixed';
    menuContainer.style.top = '0';
    menuContainer.style.left = '0';
    menuContainer.style.width = '100%';
    menuContainer.style.height = '100%';
    menuContainer.style.display = 'flex';
    menuContainer.style.justifyContent = 'center';
    menuContainer.style.alignItems = 'center';
    menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menuContainer.style.zIndex = '1000';

    // Créer le menu
    const menu = document.createElement('div');
    menu.style.backgroundColor = '#2A2A2A';
    menu.style.padding = '2rem';
    menu.style.borderRadius = '10px';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.gap = '1rem';
    menu.style.minWidth = '300px';

    // Titre
    const title = document.createElement('h1');
    title.textContent = 'Rodrigo Jack et les spectres des sables';
    title.style.color = 'white';
    title.style.textAlign = 'center';
    title.style.fontSize = '2rem';
    title.style.marginBottom = '1rem';
    menu.appendChild(title);

    // Bouton Start
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Game';
    startBtn.style.padding = '0.8rem 1.5rem';
    startBtn.style.border = 'none';
    startBtn.style.borderRadius = '5px';
    startBtn.style.backgroundColor = '#4CAF50';
    startBtn.style.color = 'white';
    startBtn.style.cursor = 'pointer';
    startBtn.style.fontSize = '1.2rem';
    startBtn.style.transition = 'background-color 0.3s';
    startBtn.onmouseover = () => startBtn.style.backgroundColor = '#45a049';
    startBtn.onmouseout = () => startBtn.style.backgroundColor = '#4CAF50';
    startBtn.onclick = () => {
        menuContainer.style.display = 'none';
        gameInstance.paused = false;
    };
    menu.appendChild(startBtn);

    // Bouton Easy (sélectionné par défaut)
    const easyBtn = document.createElement('button');
    easyBtn.textContent = 'Easy';
    easyBtn.style.padding = '0.8rem 1.5rem';
    easyBtn.style.border = 'none';
    easyBtn.style.borderRadius = '5px';
    easyBtn.style.backgroundColor = '#666666'; // Sélectionné
    easyBtn.style.color = 'white';
    easyBtn.style.cursor = 'pointer';
    easyBtn.style.fontSize = '1.2rem';

    // Bouton Medium
    const mediumBtn = document.createElement('button');
    mediumBtn.textContent = 'Medium';
    mediumBtn.style.padding = '0.8rem 1.5rem';
    mediumBtn.style.border = 'none';
    mediumBtn.style.borderRadius = '5px';
    mediumBtn.style.backgroundColor = '#4A4A4A';
    mediumBtn.style.color = 'white';
    mediumBtn.style.cursor = 'pointer';
    mediumBtn.style.fontSize = '1.2rem';

    // Bouton Hard
    const hardBtn = document.createElement('button');
    hardBtn.textContent = 'Hard';
    hardBtn.style.padding = '0.8rem 1.5rem';
    hardBtn.style.border = 'none';
    hardBtn.style.borderRadius = '5px';
    hardBtn.style.backgroundColor = '#4A4A4A';
    hardBtn.style.color = 'white';
    hardBtn.style.cursor = 'pointer';
    hardBtn.style.fontSize = '1.2rem';

    // Gestion des clics sur les boutons de difficulté
    easyBtn.onclick = () => {
        gameInstance.difficulty = 'easy';
        easyBtn.style.backgroundColor = '#666666';
        mediumBtn.style.backgroundColor = '#4A4A4A';
        hardBtn.style.backgroundColor = '#4A4A4A';
        console.log("Mode facile activé");
    };

    mediumBtn.onclick = () => {
        gameInstance.difficulty = 'medium';
        easyBtn.style.backgroundColor = '#4A4A4A';
        mediumBtn.style.backgroundColor = '#666666';
        hardBtn.style.backgroundColor = '#4A4A4A';
        console.log("Mode moyen activé");
    };

    hardBtn.onclick = () => {
        gameInstance.difficulty = 'hard';
        easyBtn.style.backgroundColor = '#4A4A4A';
        mediumBtn.style.backgroundColor = '#4A4A4A';
        hardBtn.style.backgroundColor = '#666666';
        console.log("Mode difficile activé");
    };

    menu.appendChild(easyBtn);
    menu.appendChild(mediumBtn);
    menu.appendChild(hardBtn);

    // Bouton Options (désactivé)
    const optionsBtn = document.createElement('button');
    optionsBtn.textContent = 'Options';
    optionsBtn.style.padding = '0.8rem 1.5rem';
    optionsBtn.style.border = 'none';
    optionsBtn.style.borderRadius = '5px';
    optionsBtn.style.backgroundColor = '#4A4A4A';
    optionsBtn.style.color = '#AAAAAA'; // Grisé
    optionsBtn.style.cursor = 'not-allowed';
    optionsBtn.style.fontSize = '1.2rem';
    optionsBtn.disabled = true;
    menu.appendChild(optionsBtn);

    // Ajouter le menu au conteneur
    menuContainer.appendChild(menu);

    // Ajouter le conteneur au DOM
    container.appendChild(menuContainer);

    return menuContainer;
}
