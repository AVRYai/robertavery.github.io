function createLinkButton(text, url, ariaLabel) {
  const link = document.createElement("a");
  link.className = "button";
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = text;
  link.setAttribute("aria-label", ariaLabel);
  return link;
}

function createPanel(title, items) {
  const panel = document.createElement("details");
  panel.className = "panel";

  const summary = document.createElement("summary");
  summary.textContent = title;
  panel.appendChild(summary);

  const list = document.createElement("ul");
  (items || []).forEach((item) => {
    const line = document.createElement("li");
    line.textContent = item;
    list.appendChild(line);
  });
  panel.appendChild(list);

  return panel;
}

function createProjectCard(project, skills) {
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

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.appendChild(
    createLinkButton("View Code", project.repo_url, `View source code for ${project.title}`)
  );

  if (project.demo_url) {
    actions.appendChild(
      createLinkButton("Live Demo", project.demo_url, `Open live demo for ${project.title}`)
    );
  }

  if (project.docs_url) {
    actions.appendChild(createLinkButton("Docs", project.docs_url, `Open docs for ${project.title}`));
  }

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(stack);
  card.appendChild(highlights);
  card.appendChild(actions);

  if (project.architecture_snapshot && project.architecture_snapshot.length) {
    card.appendChild(createPanel("Architecture Snapshot", project.architecture_snapshot));
  }

  if (project.evidence && project.evidence.length) {
    card.appendChild(createPanel("Evidence", project.evidence));
  }

  return card;
}

async function loadProjects() {
  const featuredRoot = document.getElementById("featured-projects");
  const moreRoot = document.getElementById("more-projects");
  const skillRoot = document.getElementById("skills");

  if (!featuredRoot || !moreRoot || !skillRoot) {
    return;
  }

  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error(`Failed to load projects.json: ${response.status}`);
    }

    const payload = await response.json();
    const projects = Array.isArray(payload) ? payload : payload.projects || [];
    const skills = new Set();

    projects.forEach((project) => {
      const card = createProjectCard(project, skills);
      if (project.featured) {
        featuredRoot.appendChild(card);
      } else {
        moreRoot.appendChild(card);
      }
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
    featuredRoot.innerHTML = `<p>Could not load project data. ${error.message}</p>`;
  }
}

loadProjects();
