import { getParticipantsByHuntIdWithUserInfo } from '@/lib/api/queries/participants/getParticpantsByHuntIdWithUserInfo';

const ParticipantsByHuntSlug = async ({ huntId }: { huntId: number }) => {
  const participants = await getParticipantsByHuntIdWithUserInfo(huntId);
  return (
    <div>
      <h2 className="text-lg font-semibold">Participants</h2>
      <ul className="list-disc">
        {participants.map((participant) => (
          <li key={participant.user.name || participant.userId}>
            {participant.user.name || participant.userId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsByHuntSlug;
