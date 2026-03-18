#!/usr/bin/env node

/**
 * Validate data/members.json entries
 * Run: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');

const MEMBERS_PATH = path.join(__dirname, '..', 'data', 'members.json');

const REQUIRED_FIELDS = ['name', 'website'];
const URL_PATTERN = /^https?:\/\/.+/;

function validateMember(member, index) {
    const errors = [];

    for (const field of REQUIRED_FIELDS) {
        if (!member[field]) {
            errors.push(`Entry ${index + 1}: Missing required field "${field}"`);
        }
    }

    if (member.website && !URL_PATTERN.test(member.website)) {
        errors.push(`Entry ${index + 1}: Website "${member.website}" must start with http:// or https://`);
    }

    if (member.website) {
        try {
            new URL(member.website);
        } catch (e) {
            errors.push(`Entry ${index + 1}: Invalid URL format "${member.website}"`);
        }
    }

    if (member.year && (typeof member.year !== 'number' || member.year < 2000 || member.year > 2100)) {
        errors.push(`Entry ${index + 1}: Year "${member.year}" must be a number between 2000 and 2100`);
    }

    return errors;
}

function validateMembers() {
    console.log('Validating data/members.json...\n');

    if (!fs.existsSync(MEMBERS_PATH)) {
        console.error('Error: members.json not found at', MEMBERS_PATH);
        process.exit(1);
    }

    let members;
    try {
        const content = fs.readFileSync(MEMBERS_PATH, 'utf8');
        members = JSON.parse(content);
    } catch (e) {
        console.error('Error: Invalid JSON format');
        console.error(e.message);
        process.exit(1);
    }

    if (!Array.isArray(members)) {
        console.error('Error: members.json must be a JSON array');
        process.exit(1);
    }

    const allErrors = [];
    const hostnames = new Set();

    members.forEach((member, index) => {
        const errors = validateMember(member, index);
        allErrors.push(...errors);

        if (member.website) {
            try {
                const hostname = new URL(member.website).hostname;
                if (hostnames.has(hostname)) {
                    allErrors.push(`Entry ${index + 1}: Duplicate hostname "${hostname}"`);
                }
                hostnames.add(hostname);
            } catch (e) {
                // URL validation already handled above
            }
        }
    });

    if (allErrors.length > 0) {
        console.error('Validation failed:\n');
        allErrors.forEach(err => console.error(`  - ${err}`));
        console.error(`\n${allErrors.length} error(s) found.`);
        process.exit(1);
    }

    console.log(`All ${members.length} members validated successfully!`);
}

validateMembers();
