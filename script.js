function slugify(input) {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createLinkButton(text, url, ariaLabel) {
  const link = document.createElement("a");
  link.className = "button";
  link.href = url;
  link.textContent = text;
  link.setAttribute("aria-label", ariaLabel);
  return link;
}

function createBulletBlock(title, items) {
  const block = document.createElement("section");
  block.className = "evidence-block";

  const header = document.createElement("h4");
  header.textContent = title;
  block.appendChild(header);

  const list = document.createElement("ul");
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  block.appendChild(list);

  return block;
}

function createProjectCard(project, skills) {
  const id = slugify(project.title);

  const card = document.createElement("article");
  card.className = "card";

  const titleRow = document.createElement("div");
  titleRow.className = "title-row";

  const title = document.createElement("h3");
  title.textContent = project.title;

  const status = document.createElement("span");
  status.className = "status-pill";
  status.textContent = project.status;

  titleRow.appendChild(title);
  titleRow.appendChild(status);

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

  const actions = document.createElement("div");
  actions.className = "card-actions";

  actions.appendChild(
    createLinkButton("Overview", `#detail-${id}`, `Open overview for ${project.title}`)
  );
  actions.appendChild(
    createLinkButton("Screenshots", `#screens-${id}`, `Jump to screenshots for ${project.title}`)
  );
  actions.appendChild(
    createLinkButton("Architecture", `#arch-${id}`, `Jump to architecture for ${project.title}`)
  );

  const subject = encodeURIComponent(`Repo access request: ${project.title}`);
  const body = encodeURIComponent(
    `Hi Robert - I saw ${project.title} on your portfolio. Could you share a private read-only link or screenshare? My context: <company/role>. Thanks!`
  );
  actions.appendChild(
    createLinkButton(
      "Request Access",
      `mailto:ravery966@gmail.com?subject=${subject}&body=${body}`,
      `Request private access for ${project.title}`
    )
  );

  card.appendChild(titleRow);
  card.appendChild(desc);
  card.appendChild(stack);
  card.appendChild(actions);

  return card;
}

function createDetail(project) {
  const id = slugify(project.title);
  const detail = document.createElement("article");
  detail.className = "detail-card";
  detail.id = `detail-${id}`;

  const heading = document.createElement("h3");
  heading.textContent = project.title;

  const status = document.createElement("p");
  status.className = "detail-status";
  status.textContent = `Status: ${project.status}`;

  const summary = document.createElement("p");
  summary.className = "detail-summary";
  summary.textContent = project.description;

  const proofWrap = document.createElement("div");
  proofWrap.className = "proof-wrap";

  const screenSection = document.createElement("section");
  screenSection.id = `screens-${id}`;
  const screenTitle = document.createElement("h4");
  screenTitle.textContent = "Screenshots";
  screenSection.appendChild(screenTitle);

  const gallery = document.createElement("div");
  gallery.className = "gallery";
  (project.proof?.screenshots || []).forEach((imagePath, index) => {
    const img = document.createElement("img");
    img.src = imagePath;
    img.loading = "lazy";
    img.alt = `${project.title} screenshot ${index + 1}`;
    gallery.appendChild(img);
  });
  screenSection.appendChild(gallery);

  const archSection = document.createElement("section");
  archSection.id = `arch-${id}`;
  const archTitle = document.createElement("h4");
  archTitle.textContent = "Architecture";
  archSection.appendChild(archTitle);

  if (project.proof?.architecture_image) {
    const archImg = document.createElement("img");
    archImg.src = project.proof.architecture_image;
    archImg.loading = "lazy";
    archImg.alt = `${project.title} architecture diagram`;
    archImg.className = "architecture-image";
    archSection.appendChild(archImg);
  }

  if (project.proof?.demo_video) {
    const video = document.createElement("a");
    video.href = project.proof.demo_video;
    video.target = "_blank";
    video.rel = "noreferrer";
    video.textContent = "Demo Video";
    archSection.appendChild(video);
  }

  proofWrap.appendChild(screenSection);
  proofWrap.appendChild(archSection);

  const evidencePanel = document.createElement("section");
  evidencePanel.className = "panel static-panel";
  const evidenceTitle = document.createElement("h4");
  evidenceTitle.textContent = "Evidence";
  evidencePanel.appendChild(evidenceTitle);
  evidencePanel.appendChild(createBulletBlock("Repository Evidence", project.evidence || []));
  evidencePanel.appendChild(createBulletBlock("What I Built", project.what_i_built || []));
  evidencePanel.appendChild(createBulletBlock("Hard Problems", project.hard_problems || []));

  if (project.how_to_run && project.how_to_run.length) {
    evidencePanel.appendChild(createBulletBlock("How To Run", project.how_to_run));
  }

  detail.appendChild(heading);
  detail.appendChild(status);
  detail.appendChild(summary);
  detail.appendChild(proofWrap);
  detail.appendChild(evidencePanel);

  return detail;
}

async function loadProjects() {
  const featuredRoot = document.getElementById("featured-projects");
  const moreRoot = document.getElementById("more-projects");
  const detailRoot = document.getElementById("project-details");
  const skillRoot = document.getElementById("skills");

  if (!featuredRoot || !moreRoot || !detailRoot || !skillRoot) {
    return;
  }

  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error(`Failed to load projects.json: ${response.status}`);
    }

    const payload = await response.json();
    const projects = payload.projects || [];
    const skills = new Set();

    projects.forEach((project) => {
      const card = createProjectCard(project, skills);
      const detail = createDetail(project);

      if (project.featured) {
        featuredRoot.appendChild(card);
      } else {
        moreRoot.appendChild(card);
      }
      detailRoot.appendChild(detail);
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
