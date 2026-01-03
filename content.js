// jsPDF is injected by background.js BEFORE this script runs
const jsPDF = window.jspdf?.jsPDF || window.jsPDF;

if (!jsPDF) {
    alert("jsPDF not available. Extension injection failed.");
    throw new Error("jsPDF missing");
}

(async function () {
    // ✅ Domain safety check
    if (!location.origin.includes('erp.iiitnr.edu.in')) {
        alert('This extension works only on the IIIT-NR ERP portal.');
        return;
    }

    // ===== Mini Progress Bar HUD =====
    const hud = document.createElement('div');
    hud.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 260px;
        background: #0f172a;
        color: #fff;
        padding: 12px 14px;
        border-radius: 10px;
        font-family: system-ui, sans-serif;
        font-size: 13px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.35);
        z-index: 999999;
    `;

    hud.innerHTML = `
        <div style="font-weight:600; margin-bottom:6px;">ERP Export</div>
        <div style="background:#1e293b; border-radius:6px; overflow:hidden; height:8px; margin-bottom:6px;">
            <div id="erp-progress-bar" style="
                height:100%;
                width:0%;
                background:#22c55e;
                transition: width 0.4s ease;
            "></div>
        </div>
        <div id="erp-progress-text" style="opacity:0.9;">Initializing…</div>
    `;

    document.body.appendChild(hud);

    const bar = hud.querySelector('#erp-progress-bar');
    const text = hud.querySelector('#erp-progress-text');

    function setProgress(percent, message) {
        bar.style.width = `${percent}%`;
        text.textContent = message;
    }

    function finishProgress(message, delay = 1800) {
        setProgress(100, message);
        setTimeout(() => hud.remove(), delay);
    }

    try {
        setProgress(10, 'Initializing…');

        async function safeFetchJSON(url) {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Fetch failed: ${url}`);
            return res.json();
        }

        function calculateTotal(assignments) {
            return (assignments || []).reduce((sum, a) => {
                const v = parseFloat(a.value);
                return sum + (isNaN(v) ? 0 : v);
            }, 0);
        }

        // ===== Fetch semesters =====
        setProgress(25, 'Fetching semesters…');
        const levels = await safeFetchJSON('/spGetStudentLevels.action');
        const reportData = [];

        for (let i = 0; i < levels.length; i++) {
            const lvl = levels[i];
            const levelId = lvl.level?.id;
            if (!levelId) continue;

            setProgress(
                40 + Math.floor((i / levels.length) * 30),
                `Fetching courses (${i + 1}/${levels.length})…`
            );

            const courses = await safeFetchJSON(
                `/spGetRegisteredCoursesInLevel.action?level.id=${levelId}`
            );

            const semester = {
                name: lvl.level?.levelDefinition?.name || 'Unknown',
                sgpa: lvl.tgpa ?? 'NA',
                cgpa: lvl.cgpa ?? 'NA',
                courses: []
            };

            courses.forEach((arr) => {
                const info = arr[0];
                const assignments = arr[1] || [];
                const course = info?.syllabusCourse?.courseClassType?.course;

                const erpTotal = Number(info?.totalMark || 0);
                const total = erpTotal > 0 ? erpTotal : calculateTotal(assignments);

                const grade =
                    info?.grade?.code ||
                    info?.forcedGrade?.code ||
                    'NA';

                semester.courses.push({
                    code: course?.code || 'NA',
                    name: course?.name || 'NA',
                    credits: info?.syllabusCourse?.credit ?? '-',
                    grade,
                    total: total.toFixed(2),
                    assignments
                });
            });

            reportData.push(semester);
        }

        // ===== Build PDF =====
        setProgress(85, 'Building PDF…');

        const doc = new jsPDF();
        let y = 15;
        const pageWidth = doc.internal.pageSize.getWidth();

        const line = () => {
            doc.line(10, y, pageWidth - 10, y);
            y += 4;
        };

        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('ERP Academic Result Report', pageWidth / 2, y, { align: 'center' });
        y += 10;

        reportData.forEach((semester) => {
            if (y > 260) {
                doc.addPage();
                y = 15;
            }

            doc.setFontSize(12);
            doc.text(`Semester: ${semester.name}`, 10, y);
            y += 6;

            doc.setFontSize(10);
            doc.setFont('times', 'normal');
            doc.text(`SGPA: ${semester.sgpa}`, 10, y);
            doc.text(`CGPA: ${semester.cgpa}`, pageWidth - 10, y, { align: 'right' });
            y += 6;

            line();

            doc.setFont('times', 'bold');
            doc.text('Code', 10, y);
            doc.text('Course Name', 30, y);
            doc.text('Cr', 120, y);
            doc.text('Grade', 135, y);
            doc.text('Marks', pageWidth - 10, y, { align: 'right' });
            y += 4;

            line();

            semester.courses.forEach((c) => {
                if (y > 260) {
                    doc.addPage();
                    y = 15;
                }

                doc.setFont('times', 'normal');
                doc.text(c.code, 10, y);
                doc.text(c.name, 30, y);
                doc.text(String(c.credits), 120, y);
                doc.text(c.grade, 135, y);
                doc.text(String(c.total), pageWidth - 10, y, { align: 'right' });
                y += 5;

                doc.setFontSize(9);
                c.assignments.forEach((a) => {
                    doc.text(
                        `• ${a.text || ''} ${a.desc || ''}: ${a.value || 'N/A'}`,
                        15,
                        y
                    );
                    y += 4;
                });

                doc.setFontSize(10);
                y += 2;
                line();
            });

            y += 6;
        });

        doc.save('ERP_Result_Report.pdf');
        finishProgress('Export complete ✅');

    } catch (err) {
        console.error(err);
        finishProgress('Error occurred ❌');
        alert('Failed to export ERP results. Check console.');
    }
})();
