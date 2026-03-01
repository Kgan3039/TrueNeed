import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fairnessMap, setFairnessMap] = useState<{ [key: string]: number }>({});
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const offersQ = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const requestsQ = query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsubOffers = onSnapshot(offersQ, (snapshot) => {
      setOffers(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
    });

    const unsubRequests = onSnapshot(requestsQ, async (snapshot) => {
      const requestData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      setRequests(requestData);

      const newFairnessMap: { [key: string]: number } = {};

      for (const req of requestData) {
        if (req.ownerUid && !newFairnessMap[req.ownerUid]) {
          const userRef = doc(db, "users", req.ownerUid);
          const snap = await getDoc(userRef);
          newFairnessMap[req.ownerUid] = snap.exists()
            ? snap.data().fairnessScore ?? 50
            : 50;
        }
      }

      setFairnessMap(newFairnessMap);
    });

    return () => {
      unsubOffers();
      unsubRequests();
    };
  }, []);

  const handleAccept = async (item: any, type: "offer" | "request") => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 🔥 Create match
      await addDoc(collection(db, "matches"), {
        offerId: type === "offer" ? item.id : null,
        offerTitle: type === "offer" ? item.title : null,
        requestId: type === "request" ? item.id : null,
        requestTitle: type === "request" ? item.title : null,
        requestOwnerUid: item.ownerUid,
        acceptedBy: currentUser.uid,
        status: "accepted",
        score: 1,
        createdAt: new Date(),
      });

      // 🔥 Update user stats (THIS FIXES IMPACT POINTS)
      const userRef = doc(db, "users", item.ownerUid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        const completedMatches = (data.completedMatches ?? 0) + 1;
        const activeRequests = Math.max((data.activeRequests ?? 0) - 1, 0);
        const offersGiven = data.offersGiven ?? 0;

        const rawScore =
          50 +
          10 * offersGiven +
          5 * completedMatches -
          5 * activeRequests;

        const fairnessScore = Math.max(
          0,
          Math.min(100, rawScore)
        );

        await updateDoc(userRef, {
          completedMatches,
          activeRequests,
          fairnessScore,
        });
      }

      navigation.navigate("MatchInbox");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to accept.");
    }
  };

  const renderPost = ({ item }: any) => {
    const isOffer = item.quantity !== undefined;

    return (
      <View style={styles.feedCard}>
        <View style={styles.cardAccent} />

        <View style={styles.topSection}>
          {item.category && (
            <Text style={styles.categoryText}>
              {item.category.toUpperCase()}
            </Text>
          )}

          <Text style={styles.centeredTitle}>
            {item.title ?? "(Untitled)"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          {isOffer ? (
            <View>
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>
                {item.quantity ?? "-"}
              </Text>
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.infoLabel}>Urgency</Text>
                <Text style={styles.infoValue}>
                  {item.urgency ?? "-"}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.infoLabel}>Fairness Score</Text>
                <View style={styles.fairnessBadge}>
                  <Text style={styles.fairnessText}>
                    {fairnessMap[item.ownerUid] ?? 50}
                  </Text>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() =>
              handleAccept(item, isOffer ? "offer" : "request")
            }
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TrueNeed</Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveIndex(0)}>
            <Text style={[styles.tabText, activeIndex === 0 && styles.activeTab]}>
              Offers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveIndex(1)}>
            <Text style={[styles.tabText, activeIndex === 1 && styles.activeTab]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeIndex === 0 ? offers : requests}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 20 }}
      />

      <View style={styles.bottomNav}>
        <NavButton
          label="Offer"
          icon={require("../../assets/icons/offer.png")}
          onPress={() => navigation.navigate("CreateOffer")}
        />
        <NavButton
          label="Request"
          icon={require("../../assets/icons/request.png")}
          onPress={() => navigation.navigate("CreateRequest")}
        />
        <NavButton
          label="Inbox"
          icon={require("../../assets/icons/inbox.png")}
          onPress={() => navigation.navigate("MatchInbox")}
        />
        <NavButton
          label="Dashboard"
          icon={require("../../assets/icons/dashboard.png")}
          onPress={() => navigation.navigate("Dashboard")}
        />
      </View>
    </View>
  );
}

function NavButton({ label, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Image source={icon} style={styles.navIconImage} />
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },

  header: {
    backgroundColor: "#10b981",
    paddingTop: 55,
    paddingBottom: 25,
    alignItems: "center",
  },

  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    marginBottom: 15,
  },

  tabsContainer: { flexDirection: "row", gap: 35 },

  tabText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1fae5",
  },

  activeTab: {
    color: "white",
    borderBottomWidth: 3,
    borderColor: "white",
    paddingBottom: 4,
  },

  feedCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 28,
    borderRadius: 24,
    elevation: 6,
  },

  cardAccent: {
    height: 4,
    width: 50,
    backgroundColor: "#10b981",
    borderRadius: 4,
    marginBottom: 10,
  },

  topSection: {
    alignItems: "center",
  },

  categoryText: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },

  centeredTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#065f46",
    marginTop: 2,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 18,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065f46",
  },

  fairnessBadge: {
    backgroundColor: "#065f46",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  fairnessText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  acceptButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  acceptButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  navItem: { alignItems: "center" },

  navIconImage: { width: 38, height: 38, resizeMode: "contain" },

  navText: {
    fontSize: 12,
    marginTop: 6,
    color: "#065f46",
    fontWeight: "600",
  },
});