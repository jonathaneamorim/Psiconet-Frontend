import { FormRegister } from "@/components/templates/FormRegister";
import { getLegalVersions } from "@/services/legalService";

export default async function Register() {
    const versions = await getLegalVersions();
    return (
        <FormRegister
            termsVersion={versions?.terms.version ?? null}
            privacyVersion={versions?.privacy.version ?? null}
        />
    );
}
