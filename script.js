async function loadProjects() {
  const projectRoot = document.getElementById("projects");
  const skillRoot = document.getElementById("skills");

  if (!projectRoot || !skillRoot) {
    return;
  }

  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error(`Failed to load projects.json: ${response.status}`);
    }

    const projects = await response.json();
    const skills = new Set();

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "card";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const desc = document.createElement("p");
      desc.textContent = project.description;

      const stack = document.createElement("div");
      stack.className = "meta";
      (project.tech_stack || []).forEach((tech) => {
        skills.add(tech);
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = tech;
        stack.appendChild(chip);
      });

      const highlights = document.createElement("div");
      highlights.className = "highlights";
      (project.highlights || []).forEach((item) => {
        const line = document.createElement("span");
        line.className = "highlight";
        line.textContent = `- ${item}`;
        highlights.appendChild(line);
      });

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(stack);
      card.appendChild(highlights);
      projectRoot.appendChild(card);
    });

    [...skills]
      .sort((a, b) => a.localeCompare(b))
      .forEach((skill) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = skill;
        skillRoot.appendChild(chip);
      });
  } catch (error) {
    projectRoot.innerHTML = `<p>Could not load project data. ${error.message}</p>`;
  }
}

loadProjects();
