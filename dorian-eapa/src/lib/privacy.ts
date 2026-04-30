export function generateAnonymousId(): string {
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `EAPA-${rnd}`;
}

export function removeDirectIdentity<T extends Record<string, unknown>>(payload: T): T {
  const blocked = ["nom", "prenom", "dateDeNaissance", "name", "firstname", "lastname", "dob"];
  const clone = { ...payload };

  for (const key of blocked) {
    if (key in clone) {
      delete clone[key];
    }
  }
  return clone;
}
