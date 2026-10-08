import json
import urllib.request
import os

def setup_test_smtp():
    print("=== Provisioning Developer SMTP Account ===")
    
    url = "https://api.nodemailer.com/user"
    
    # Ethereal requires a JSON body specifying requestor and version
    payload = json.dumps({
        "requestor": "Voltgrid",
        "version": "1.0.0"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        username = data.get("user")
        password = data.get("pass")
        host = data.get("smtp", {}).get("host", "smtp.ethereal.email")
        port = data.get("smtp", {}).get("port", 587)
        
        print(f"[+] Account created successfully!")
        print(f"    SMTP Host: {host}")
        print(f"    SMTP User: {username}")
        print(f"    SMTP Pass: {password}")
        print(f"    Inbox URL: https://ethereal.email/messages")
        
        # Read the current .env file content
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                lines = f.readlines()
        else:
            lines = []
            
        # Update or add SMTP credentials
        new_lines = []
        smtp_keys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "SMTP_FROM"]
        written_keys = set()
        
        for line in lines:
            line_strip = line.strip()
            # If the line defines one of our target keys, replace it
            replaced = False
            for key in smtp_keys:
                if line_strip.startswith(f"{key}="):
                    if key == "SMTP_HOST":
                        new_lines.append(f"SMTP_HOST={host}\n")
                    elif key == "SMTP_PORT":
                        new_lines.append(f"SMTP_PORT={port}\n")
                    elif key == "SMTP_USERNAME":
                        new_lines.append(f"SMTP_USERNAME={username}\n")
                    elif key == "SMTP_PASSWORD":
                        new_lines.append(f"SMTP_PASSWORD={password}\n")
                    elif key == "SMTP_FROM":
                        new_lines.append(f"SMTP_FROM={username}\n")
                    written_keys.add(key)
                    replaced = True
                    break
            if not replaced:
                new_lines.append(line)
                
        # Append any keys that weren't already present in .env
        for key in smtp_keys:
            if key not in written_keys:
                if key == "SMTP_HOST":
                    new_lines.append(f"SMTP_HOST={host}\n")
                elif key == "SMTP_PORT":
                    new_lines.append(f"SMTP_PORT={port}\n")
                elif key == "SMTP_USERNAME":
                    new_lines.append(f"SMTP_USERNAME={username}\n")
                elif key == "SMTP_PASSWORD":
                    new_lines.append(f"SMTP_PASSWORD={password}\n")
                elif key == "SMTP_FROM":
                    new_lines.append(f"SMTP_FROM={username}\n")
                    
        # Save updated .env
        with open(env_path, "w") as f:
            f.writelines(new_lines)
            
        print(f"\n[+] Successfully updated {env_path} with developer SMTP settings.")
        print(f"[!] You can view all sent OTP emails by logging into: https://ethereal.email/ with:")
        print(f"    Email: {username}")
        print(f"    Password: {password}")
        
    except Exception as e:
        print(f"[-] Failed to provision test SMTP: {e}")

if __name__ == "__main__":
    setup_test_smtp()
