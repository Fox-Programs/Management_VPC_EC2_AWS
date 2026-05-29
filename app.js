require('dotenv').config();
const express = require('express');
const {
    EC2Client,
    DescribeInstancesCommand, RunInstancesCommand, TerminateInstancesCommand,
    DescribeVpcsCommand, CreateVpcCommand, DeleteVpcCommand,
    DescribeSubnetsCommand, CreateSubnetCommand, DeleteSubnetCommand
} = require("@aws-sdk/client-ec2");

const app = express();
const client = new EC2Client({ region: "eu-west-3" });

app.use(express.json());
app.use(express.static('public'));

// --- ROUTES EC2 ---
app.get('/api/instances', async (req, res) => {
    try {
        const data = await client.send(new DescribeInstancesCommand({}));
        res.json(data.Reservations.flatMap(r => r.Instances));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/instances', async (req, res) => {
    try {
        const command = new RunInstancesCommand({
            ImageId: "ami-0be40a46b4111e7f5",
            InstanceType: "t3.micro",
            MinCount: 1, MaxCount: 1
        });
        const data = await client.send(command);
        res.json(data.Instances[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/instances/:id', async (req, res) => {
    try {
        await client.send(new TerminateInstancesCommand({ InstanceIds: [req.params.id] }));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/instances/:id/type', async (req, res) => {
    try {
        const { ModifyInstanceAttributeCommand } = require("@aws-sdk/client-ec2");
        await client.send(new ModifyInstanceAttributeCommand({
            InstanceId: req.params.id,
            InstanceType: { Value: req.body.newType }
        }));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/instances/:id/state', async (req, res) => {
    try {
        const { StartInstancesCommand, StopInstancesCommand } = require("@aws-sdk/client-ec2");
        const action = req.body.action;
        const command = action === 'start' ? new StartInstancesCommand({ InstanceIds: [req.params.id] }) : new StopInstancesCommand({ InstanceIds: [req.params.id] });
        await client.send(command);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROUTES VPC ---
app.get('/api/vpcs', async (req, res) => {
    try {
        const data = await client.send(new DescribeVpcsCommand({}));
        console.log(data.Vpcs);
        res.json(data.Vpcs || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/vpcs', async (req, res) => {
    try {
        const command = new CreateVpcCommand({ CidrBlock: req.body.cidr });
        const data = await client.send(command);
        res.json(data.Vpc);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/vpcs/:id', async (req, res) => {
    try {
        const command = new DeleteVpcCommand({ VpcId: req.params.id });
        await client.send(command);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vpcs/:id/name', async (req, res) => {
    try {
        const { CreateTagsCommand } = require("@aws-sdk/client-ec2");
        await client.send(new CreateTagsCommand({
            Resources: [req.params.id],
            Tags: [{ Key: "Name", Value: req.body.newName }]
        }));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.post('/api/vpcs/:id/cidr', async (req, res) => {
    try {
        const { AssociateVpcCidrBlockCommand } = require("@aws-sdk/client-ec2");
        await client.send(new AssociateVpcCidrBlockCommand({
            VpcId: req.params.id,
            CidrBlock: req.body.cidr
        }));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.delete('/api/vpcs/:id/cidr', async (req, res) => {
    try {
        const { DisassociateVpcCidrBlockCommand } = require("@aws-sdk/client-ec2");
        await client.send(new DisassociateVpcCidrBlockCommand({
            AssociationId: req.body.associationId
        }));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.post('/api/vpcs/:id/igw', async (req, res) => {
    try {
        const { CreateInternetGatewayCommand, AttachInternetGatewayCommand } = require("@aws-sdk/client-ec2");

        // 1. Créer la passerelle
        const createRes = await client.send(new CreateInternetGatewayCommand({}));
        const igwId = createRes.InternetGateway.InternetGatewayId;

        // 2. L'attacher au VPC
        await client.send(new AttachInternetGatewayCommand({
            InternetGatewayId: igwId,
            VpcId: req.params.id
        }));

        res.json({ igwId: igwId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});



app.listen(3000, () => console.log('Admin AWS lancé sur http://localhost:3000'));
