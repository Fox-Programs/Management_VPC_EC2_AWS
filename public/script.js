// --- UTILITAIRES ---
function log(message, isError = false) {
    const consoleDiv = document.getElementById('logConsole');
    const time = new Date().toLocaleTimeString();
    const color = isError ? 'red' : '#00ff00';
    consoleDiv.innerHTML += `<div style="color: ${color}">[${time}] ${message}</div>`;
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// --- LOGIQUE EC2 ---
async function fetchInstances() {
    try {
        const res = await fetch('/api/instances');
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const tbody = document.querySelector('#ec2Table tbody');
        tbody.innerHTML = data.map(i => `
        <tr>
            <td><code>${i.InstanceId}</code></td>
            <td>${i.InstanceType}</td>
            <td class="status-${i.State.Name}">${i.State.Name}</td>
            <td>${i.ImageId}</td>
            <td>
                <button class="btn-action" onclick="toggleInstanceState('${i.InstanceId}', '${i.State.Name}')">
                    ${i.State.Name === 'running' ? '⏸ Arrêter' : '▶️ Démarrer'}
                </button>
                <button class="btn-delete" onclick="terminateInstance('${i.InstanceId}')">Supprimer</button>
            </td>
        </tr>
        `).join('');
        log("Instances EC2 mises à jour.");
        document.getElementById('apiStatus').innerText = "Connecté";
    } catch (err) {
        log(err.message, true);
    }
}

async function createInstance() {
    log("Demande de création d'instance...");
    const res = await fetch('/api/instances', { method: 'POST' });
    const data = await res.json();
    data.error ? log(data.error, true) : log(`Instance créée : ${data.InstanceId}`);
    fetchInstances();
}

async function terminateInstance(id) {
    if (!confirm("Voulez-vous vraiment supprimer l'instance " + id + " ?")) return;
    await fetch(`/api/instances/${id}`, { method: 'DELETE' });
    log(`Demande de suppression envoyée pour ${id}`);
    fetchInstances();
}

// --- LOGIQUE VPC ---
async function fetchVpcs() {
    try {
        const res = await fetch('/api/vpcs');
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const tbody = document.querySelector('#vpcTable tbody');

        tbody.innerHTML = data.map(v => {
            // On cherche le tag "Name" s'il existe
            const nameTag = v.Tags ? v.Tags.find(t => t.Key === 'Name') : null;
            const vpcName = nameTag ? nameTag.Value : '<em>Sans nom</em>';

            return `
        <tr>
            <td><strong>${vpcName}</strong></td>
            <td><code>${v.VpcId}</code></td>
            <td>${v.CidrBlock}</td>
            <td>
                <button class="btn-rename" onclick="renameVpc('${v.VpcId}')">✏️ Nommer</button>
                <button class="btn-delete" onclick="deleteVpc('${v.VpcId}')">Supprimer</button>
            </td>
        </tr>
        `;
        }).join('');
        log("Réseaux VPC mis à jour.");
    } catch (err) {
        log(err.message, true);
    }
}

async function createVpc() {
    const cidr = document.getElementById('vpcCidr').value || "10.0.0.0/16";
    log(`Création du VPC avec le CIDR ${cidr}...`);
    const res = await fetch('/api/vpcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidr })
    });
    const data = await res.json();
    data.error ? log(data.error, true) : log(`VPC créé : ${data.VpcId}`);
    fetchVpcs();
}

async function deleteVpc(id) {
    const res = await fetch(`/api/vpcs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    data.error ? log(data.error, true) : log(`VPC ${id} supprimé.`);
    fetchVpcs();
}

async function toggleInstanceState(id, currentStatus) {
    const action = currentStatus === 'running' ? 'stop' : 'start';
    log(`Demande de ${action} pour l'instance ${id}...`);

    const res = await fetch(`/api/instances/${id}/state`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action })
    });
    const data = await res.json();
    data.error ? log(data.error, true) : log(`Action ${action} envoyée !`);
    setTimeout(fetchInstances, 2000); // On attend 2s que l'état change avant de rafraîchir
}

async function renameVpc(id) {
    const newName = prompt("Entrez le nouveau nom pour ce VPC :");
    if (!newName) return;

    const res = await fetch(`/api/vpcs/${id}/name`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ newName })
    });
    const data = await res.json();
    data.error ? log(data.error, true) : log(`VPC ${id} renommé en "${newName}"`);
    fetchVpcs();
}

// Chargement initial
window.onload = () => {
    fetchInstances();
    fetchVpcs();
};