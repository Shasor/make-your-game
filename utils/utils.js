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
