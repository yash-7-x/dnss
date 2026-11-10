
const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const { isIP } = require("node:net");

// 1. Terminal input interface
const rl = readline.createInterface({
    input: stdin,
    output: stdout
});

// 2. Normalize domain input
function normalizeDomain(input) {
    let value = input.trim();

    if (!value) {
        throw new Error("Domain cannot be empty.");
    }

    if (!/^https?:\/\//i.test(value)) {
        value = "http://" + value;
    }

    const parsedURL = new URL(value);

    return parsedURL.hostname.toLowerCase();
}

// 3. DNS lookup functions
async function getIPv4(domain) {
    return await dnsPromises.resolve4(domain, {
        ttl: true
    });
}

async function getIPv6(domain) {
    return await dnsPromises.resolve6(domain);
}

async function getMX(domain) {
    return await dnsPromises.resolveMx(domain);
}

async function getNameServers(domain) {
    return await dnsPromises.resolveNs(domain);
}

async function getCNAME(domain) {
    return await dnsPromises.resolveCname(domain);
}

async function getReverseDNS(ipAddress) {
    return await dnsPromises.reverse(ipAddress);
}

// 4. Safe DNS query wrapper
async function safeQuery(label, queryFunction) {
    try {
        const data = await queryFunction();

        return {
            label,
            data,
            error: null
        };
    } catch (error) {
        return {
            label,
            data: null,
            error: error.code || error.message
        };
    }
}

// 5. Main application
async function main() {
    try {
        console.log("\n=================================");
        console.log("         DNS INSPECTOR");
        console.log("=================================\n");

        const input = await rl.question(
            "Enter a domain or website URL: "
        );

        const domain = normalizeDomain(input);

        console.log(`\nInspecting: ${domain}\n`);
        console.log("Fetching DNS records...\n");

        const results = await Promise.all([
            safeQuery("System Lookup", async () => {
                return await dnsPromises.lookup(domain, {
                    all: true
                });
            }),

            safeQuery("IPv4 (A)", () => getIPv4(domain)),
            safeQuery("IPv6 (AAAA)", () => getIPv6(domain)),
            safeQuery("Mail Servers (MX)", () => getMX(domain)),
            safeQuery("Name Servers (NS)", () => getNameServers(domain)),
            safeQuery("CNAME", () => getCNAME(domain))
        ]);

        console.log("========== DNS RESULTS ==========\n");

        for (const result of results) {
            console.log(`--- ${result.label} ---`);

            if (result.error) {
                console.log(`Unavailable: ${result.error}`);
            } else {
                console.log(
                    JSON.stringify(result.data, null, 2)
                );
            }

            console.log();
        }

        console.log("=================================\n");

        const ipAddress = await rl.question(
            "Enter an IP address for reverse DNS lookup (or press Enter to skip): "
        );

        if (ipAddress.trim()) {
            const ip = ipAddress.trim();

            if (!isIP(ip)) {
                console.log("\nInvalid IP address.");
            } else {
                const reverseResult = await safeQuery(
                    "Reverse DNS (PTR)",
                    () => getReverseDNS(ip)
                );

                console.log("\n--- Reverse DNS Results ---");

                if (reverseResult.error) {
                    console.log(
                        `Unavailable: ${reverseResult.error}`
                    );
                } else {
                    console.log(
                        JSON.stringify(
                            reverseResult.data,
                            null,
                            2
                        )
                    );
                }
            }
        }

    } catch (error) {
        console.error("\nError:", error.message);
    } finally {
        rl.close();
    }
}

main();
