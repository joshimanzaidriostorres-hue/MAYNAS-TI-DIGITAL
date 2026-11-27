
document.addEventListener("DOMContentLoaded", function () {
    // NAVEGACIÓN ENTRE VISTAS
    const pageSections = document.querySelectorAll(".page-section");

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (event) {
            const sectionId = this.getAttribute("href").substring(1);
            const target = document.getElementById(sectionId);

            if (!target || !target.classList.contains("page-section")) {
                return;
            }

            event.preventDefault();

            pageSections.forEach(section => {
                section.classList.remove("active");
            });

            target.classList.add("active");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
    // ==================================
    // MENÚ DE NAVEGACIÓN
    // ==================================

    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");

    if (menuToggle && navigation) {

        menuToggle.addEventListener("click", function () {

            const isOpen = navigation.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", isOpen);
            menuToggle.textContent = isOpen ? "✕" : "☰";

        });

        navigation.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", function () {

                navigation.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";

            });

        });

    }

    // ==================================
    // CARGAR ESPECIALIDADES
    // ==================================

    const container = document.getElementById("specialtyContainer");

    if (!container || typeof especialidades === "undefined") {
        console.error("No se encontraron los datos de especialidades.");
        return;
    }

    const searchInput = document.getElementById("searchProgram");
    const cycleFilter = document.getElementById("filterCycle");
    const shiftFilter = document.getElementById("filterShift");
    const clearButton = document.getElementById("clearFilters");
    const count = document.getElementById("programCount");
    const noPrograms = document.getElementById("noPrograms");

    const normalize = text => text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    // CREAR OPCIONES DE CICLOS
    const cycles = [...new Set(
        especialidades
            .map(program => program.ciclo)
            .filter(Boolean)
    )];

    cycles.forEach(cycle => {

        const option = document.createElement("option");
        option.value = cycle;
        option.textContent = `Ciclo ${cycle}`;

        cycleFilter.appendChild(option);

    });

    // CREAR OPCIONES DE TURNOS
    const shifts = [...new Set(
        especialidades.flatMap(program => program.turnos)
    )];

    shifts.forEach(shift => {

        const option = document.createElement("option");
        option.value = shift;
        option.textContent = shift;

        shiftFilter.appendChild(option);

    });

    // CREAR TARJETAS
    container.innerHTML = "";

    especialidades.forEach((program, index) => {

        const card = document.createElement("article");
        card.className = "specialty-card";

        const imageBox = document.createElement("div");
        imageBox.className = "specialty-image";

        const img = document.createElement("img");

        img.src = `assets/images/especialidad-${index + 1}.jpg`;
        img.alt = program.nombre;
        img.loading = "lazy";

        img.onerror = function () {
            this.style.display = "none";
            imageBox.classList.add("image-placeholder");
            imageBox.textContent = "CETPRO MAYNAS";
        };

        imageBox.appendChild(img);

        const content = document.createElement("div");
        content.className = "specialty-content";

        const level = document.createElement("span");
        level.className = "specialty-level";
        level.textContent = program.nivel;

        const title = document.createElement("h3");
        title.textContent = program.nombre;

        const cycle = document.createElement("p");
        cycle.textContent = program.ciclo
            ? `Ciclo: ${program.ciclo}`
            : "Ciclo: Por confirmar";

        const turns = document.createElement("p");
        turns.textContent = `Turnos: ${program.turnos.join(", ")}`;

        content.append(level, title, cycle, turns);
        card.append(imageBox, content);

        container.appendChild(card);

    });

    // ==================================
    // BUSCADOR Y FILTROS
    // ==================================

    function filterPrograms() {

        const search = normalize(searchInput.value);
        const cycle = cycleFilter.value;
        const shift = shiftFilter.value;

        let visible = 0;

        const cards = container.querySelectorAll(".specialty-card");

        cards.forEach((card, index) => {

            const program = especialidades[index];

            const matchesSearch =
                normalize(program.nombre).includes(search);

            const matchesCycle =
                !cycle || program.ciclo === cycle;

            const matchesShift =
                !shift || program.turnos.includes(shift);

            const show =
                matchesSearch && matchesCycle && matchesShift;

            card.hidden = !show;

            if (show) visible++;

        });

        count.textContent =
            `Mostrando ${visible} de ${especialidades.length} programas de estudios.`;

        noPrograms.hidden = visible !== 0;

    }

    searchInput.addEventListener("input", filterPrograms);
    cycleFilter.addEventListener("change", filterPrograms);
    shiftFilter.addEventListener("change", filterPrograms);

    clearButton.addEventListener("click", function () {

        searchInput.value = "";
        cycleFilter.value = "";
        shiftFilter.value = "";

        filterPrograms();

    });

    filterPrograms();

    console.log("MAYNAS TI DIGITAL iniciado correctamente.");

    // ==================================
    // ENVÍO DE PREINSCRIPCIONES
    // ==================================

    const formPreinscripcion = document.getElementById("formPreinscripcion");

    if (formPreinscripcion) {

        formPreinscripcion.addEventListener("submit", async function (event) {

            event.preventDefault();

            const datos = Object.fromEntries(
                new FormData(formPreinscripcion).entries()
            );

            try {

                const respuesta = await fetch(
                    "http://127.0.0.1:5000/registrar-preinscripcion",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(datos)
                    }
                );

                const resultado = await respuesta.json();

                if (!respuesta.ok) {
                    alert(resultado.mensaje);
                    return;
                }

                alert("¡Preinscripción registrada correctamente!");

                formPreinscripcion.reset();

            } catch (error) {

                alert("No se pudo conectar con el servidor. Inténtalo nuevamente.");

                console.error(error);

            }

        });

    }

});

